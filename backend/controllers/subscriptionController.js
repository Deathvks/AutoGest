// autogest-app/backend/controllers/subscriptionController.js

const { User } = require('../models');

// Configuración dinámica de Stripe basada en el entorno (producción o desarrollo)
const stripe = require('stripe')(
  process.env.NODE_ENV === 'production' 
    ? process.env.STRIPE_SECRET_KEY_LIVE 
    : process.env.STRIPE_SECRET_KEY_TEST
);

// Función para obtener las claves correctas según el entorno
const getStripeConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    priceId: isProduction ? process.env.STRIPE_PRICE_ID_LIVE : process.env.STRIPE_PRICE_ID_TEST,
    webhookSecret: isProduction ? process.env.STRIPE_WEBHOOK_SECRET_LIVE : process.env.STRIPE_WEBHOOK_SECRET_TEST,
  };
};

// Crear una nueva suscripción
exports.createSubscription = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        const userId = req.user.id;
        const { priceId } = getStripeConfig();

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        let customerId = user.stripeCustomerId;

        // 1. Crear cliente en Stripe si no existe
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            customerId = customer.id;
            await user.update({ stripeCustomerId: customerId });
        } else {
            // Adjuntar y establecer como método de pago por defecto si el cliente ya existe
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
            await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
        }

        // 2. Crear la suscripción
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            // --- INICIO DE LA MODIFICACIÓN ---
            // Aseguramos que no haya un período de prueba para forzar la factura inicial
            trial_period_days: 0, 
            // --- FIN DE LA MODIFICACIÓN ---
        });

        if (!subscription.latest_invoice || !subscription.latest_invoice.payment_intent) {
            console.error('Stripe subscription object without payment intent:', subscription);
            return res.status(500).json({ error: 'No se pudo crear la intención de pago.' });
        }

        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        });

    } catch (error) {
        console.error('Error creando suscripción:', error);
        res.status(500).json({ error: 'Error al crear la suscripción' });
    }
};

// Obtener el estado de la suscripción del usuario
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            subscriptionStatus: user.subscriptionStatus,
            subscriptionExpiry: user.subscriptionExpiry,
        });

    } catch (error) {
        console.error('Error verificando suscripción:', error);
        res.status(500).json({ error: 'Error al verificar la suscripción' });
    }
};

// Cancelar una suscripción (al final del período de facturación)
exports.cancelSubscription = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'Suscripción no encontrada' });
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
            limit: 1
        });

        if (subscriptions.data.length === 0) {
            return res.status(404).json({ error: 'No se encontraron suscripciones activas.' });
        }

        await stripe.subscriptions.update(subscriptions.data[0].id, {
            cancel_at_period_end: true,
        });
        
        // Actualizamos nuestro estado interno a 'cancelled'
        await user.update({ subscriptionStatus: 'cancelled' });

        res.json({ message: 'Tu suscripción se cancelará al final del período de facturación actual.' });

    } catch (error) {
        console.error('Error cancelando suscripción:', error);
        res.status(500).json({ error: 'Error al cancelar la suscripción' });
    }
};

// Manejador de Webhooks de Stripe
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const { webhookSecret } = getStripeConfig();
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error(`❌ Error en la firma del webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    try {
        const session = event.data.object;
        const customerId = session.customer;
        const user = await User.findOne({ where: { stripeCustomerId: customerId } });

        if (user) {
            switch (event.type) {
                case 'invoice.payment_succeeded':
                    const subscription = await stripe.subscriptions.retrieve(session.subscription);
                    await user.update({
                        subscriptionStatus: 'active',
                        subscriptionExpiry: new Date(subscription.current_period_end * 1000),
                    });
                    break;
                case 'invoice.payment_failed':
                    await user.update({ subscriptionStatus: 'past_due' });
                    break;
                case 'customer.subscription.deleted':
                case 'customer.subscription.updated':
                     if (session.cancel_at_period_end || session.status === 'canceled') {
                        await user.update({ subscriptionStatus: 'cancelled' });
                     }
                    break;
                default:
                    console.log(`Evento no manejado: ${event.type}`);
            }
        }
    } catch(error) {
        console.error('Error procesando el webhook:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json({ received: true });
};