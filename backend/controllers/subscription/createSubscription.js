// autogest-app/backend/controllers/subscription/createSubscription.js
const { User } = require('../../models');
const { stripe, getStripeConfig } = require('./stripeConfig');

exports.createSubscription = async (req, res) => {
    console.log('[CREATE_SUB] Iniciando proceso de creación de suscripción...');
    try {
        const { paymentMethodId } = req.body;
        const userId = req.user.id;
        const { priceId } = getStripeConfig();
        
        console.log(`[CREATE_SUB] User ID: ${userId}, PaymentMethod ID: ${paymentMethodId ? 'recibido' : 'NO recibido'}, Price ID: ${priceId}`);

        if (!paymentMethodId) {
            return res.status(400).json({ error: 'No se proporcionó un método de pago.' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        console.log(`[CREATE_SUB] Usuario encontrado: ${user.email}`);

        let customerId = user.stripeCustomerId;

        if (!customerId) {
            console.log('[CREATE_SUB] Creando nuevo cliente en Stripe...');
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
            console.log(`[CREATE_SUB] Nuevo customerId creado: ${customerId}`);
        } else {
            console.log(`[CREATE_SUB] Cliente existente: ${customerId}. Adjuntando método de pago...`);
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
            await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
            console.log('[CREATE_SUB] Método de pago por defecto actualizado.');
        }

        console.log(`[CREATE_SUB] Creando suscripción para customer ${customerId} con price ${priceId}...`);
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete', // Permite crear la suscripción en estado incompleto
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        console.log(`[CREATE_SUB] Suscripción creada con ID: ${subscription.id}`);
        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
            status: subscription.status,
        });

    } catch (error) {
        // --- INICIO DE LA MODIFICACIÓN ---
        // Manejo específico del error que requiere autenticación del usuario.
        if (error.code === 'subscription_payment_intent_requires_action') {
            console.warn('[CREATE_SUB] Se requiere acción del usuario para confirmar el pago.');
            return res.status(400).json({
                error: 'requires_action',
                paymentIntentClientSecret: error.raw.latest_invoice.payment_intent.client_secret,
            });
        }
        
        console.error('--- ERROR DETALLADO EN CREATE_SUB ---');
        console.error('Mensaje:', error.message);
        console.error("------------------------------------");
        res.status(500).json({ error: error.message || 'Error al crear la suscripción.' });
        // --- FIN DE LA MODIFICACIÓN ---
    }
};