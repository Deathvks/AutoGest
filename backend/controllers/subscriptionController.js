// Al inicio del archivo, reemplaza la línea de stripe
const stripe = require('stripe')(
  process.env.NODE_ENV === 'production' 
    ? process.env.STRIPE_SECRET_KEY_LIVE 
    : process.env.STRIPE_SECRET_KEY_TEST
);

// Función helper para obtener el Price ID correcto
const getStripeConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    priceId: isProduction ? process.env.STRIPE_PRICE_ID_LIVE : process.env.STRIPE_PRICE_ID_TEST,
    webhookSecret: isProduction ? process.env.STRIPE_WEBHOOK_SECRET_LIVE : process.env.STRIPE_WEBHOOK_SECRET_TEST,
    publishableKey: isProduction ? process.env.STRIPE_PUBLISHABLE_KEY_LIVE : process.env.STRIPE_PUBLISHABLE_KEY_TEST
  };
};
const { User } = require('../models');

// Crear una suscripción
exports.createSubscription = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        let customerId = user.stripeCustomerId;

        // Crear cliente en Stripe si no existe
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

            // Actualizar usuario con el ID del cliente de Stripe
            await user.update({ stripeCustomerId: customerId });
        } else {
            // Adjuntar método de pago al cliente existente
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });

            // Actualizar método de pago por defecto
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
        }

        // Crear suscripción
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{
                price: process.env.STRIPE_PRICE_ID, // ID del precio mensual en Stripe
            }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
        });

        // Actualizar estado del usuario
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        await user.update({
            subscriptionStatus: 'active',
            subscriptionExpiry: expiryDate,
        });

        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        });

    } catch (error) {
        console.error('Error creando suscripción:', error);
        res.status(500).json({ error: 'Error al crear la suscripción' });
    }
};

// Verificar estado de suscripción
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si la suscripción ha expirado
        if (user.subscriptionExpiry && new Date() > user.subscriptionExpiry) {
            await user.update({ subscriptionStatus: 'inactive' });
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

// Cancelar suscripción
exports.cancelSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'Usuario o suscripción no encontrada' });
        }

        // Obtener suscripciones activas del cliente
        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
        });

        if (subscriptions.data.length > 0) {
            // Cancelar la primera suscripción activa
            await stripe.subscriptions.update(subscriptions.data[0].id, {
                cancel_at_period_end: true,
            });
        }

        // Actualizar estado del usuario
        await user.update({ subscriptionStatus: 'cancelled' });

        res.json({ message: 'Suscripción cancelada exitosamente' });

    } catch (error) {
        console.error('Error cancelando suscripción:', error);
        res.status(500).json({ error: 'Error al cancelar la suscripción' });
    }
};

// Webhook de Stripe para manejar eventos
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Error verificando webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    switch (event.type) {
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            // Actualizar suscripción como activa
            const customer = await stripe.customers.retrieve(invoice.customer);
            const user = await User.findOne({ where: { stripeCustomerId: customer.id } });
            if (user) {
                const expiryDate = new Date(invoice.period_end * 1000);
                await user.update({
                    subscriptionStatus: 'active',
                    subscriptionExpiry: expiryDate,
                });
            }
            break;

        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            const failedCustomer = await stripe.customers.retrieve(failedInvoice.customer);
            const failedUser = await User.findOne({ where: { stripeCustomerId: failedCustomer.id } });
            if (failedUser) {
                await failedUser.update({ subscriptionStatus: 'past_due' });
            }
            break;

        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            const deletedCustomer = await stripe.customers.retrieve(subscription.customer);
            const deletedUser = await User.findOne({ where: { stripeCustomerId: deletedCustomer.id } });
            if (deletedUser) {
                await deletedUser.update({ subscriptionStatus: 'inactive' });
            }
            break;

        default:
            console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });
};