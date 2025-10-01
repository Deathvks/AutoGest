// autogest-app/backend/controllers/subscription/createSubscription.js
const { User } = require('../../models');
const { stripe, getStripeConfig } = require('./stripeConfig');

exports.createSubscription = async (req, res) => {
    console.log('[CREATE_SUB] Iniciando proceso de creación de suscripción (v4)...');
    try {
        const { paymentMethodId } = req.body;
        const userId = req.user.id;
        const { priceId } = getStripeConfig();

        if (!paymentMethodId) {
            return res.status(400).json({ error: 'No se proporcionó un método de pago.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                payment_method: paymentMethodId,
                invoice_settings: { default_payment_method: paymentMethodId },
            });
            customerId = customer.id;
            await user.update({ stripeCustomerId: customerId });
        } else {
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
            await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
        }
        
        console.log(`[CREATE_SUB] Creando suscripción para customer ${customerId} con price ${priceId}...`);

        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'error_if_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });

    } catch (error) {
        // --- INICIO DE LA MODIFICACIÓN ---
        // La clave es buscar el client_secret dentro de `error.raw.latest_invoice.payment_intent.client_secret`.
        if (error.code === 'subscription_payment_intent_requires_action' && error.raw?.latest_invoice?.payment_intent?.client_secret) {
            console.log('[CREATE_SUB] Se requiere acción del cliente. Enviando client_secret desde error.raw.latest_invoice.payment_intent...');
            return res.json({
                clientSecret: error.raw.latest_invoice.payment_intent.client_secret,
            });
        }
        // --- FIN DE LA MODIFICACIÓN ---

        console.error('--- ERROR DETALLADO EN CREATE_SUB ---');
        console.error('Mensaje:', error.message);
        console.error('Tipo:', error.type);
        console.error('Código:', error.code);
        if (error.raw) console.error('Error Raw:', JSON.stringify(error.raw, null, 2));
        console.error('Stack:', error.stack);
        console.error("------------------------------------");
        res.status(500).json({ error: error.message || 'Error al crear la suscripción. Por favor, revisa los logs del servidor.' });
    }
};