// autogest-app/backend/controllers/subscription/createSubscription.js
const { User } = require('../../models');
const { stripe, getStripeConfig } = require('./stripeConfig');

exports.createSubscription = async (req, res) => {
    console.log('[CREATE_SUB] Iniciando el proceso de creación de suscripciones (v6)...');
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

        // --- INICIO DE LA MODIFICACIÓN ---
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete', // Permite que la suscripción se cree en estado incompleto si se requiere acción
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'], // Expande el payment_intent para obtener el client_secret
        });

        console.log('[CREATE_SUB] Objeto de suscripción devuelto por Stripe:', JSON.stringify(subscription, null, 2));
        
        // Si la suscripción se activa inmediatamente (pago exitoso sin 3DS)
        if (subscription.status === 'active') {
            console.log('[CREATE_SUB] Suscripción activada inmediatamente.');
            return res.json({
                subscriptionId: subscription.id,
                status: 'active',
                clientSecret: null,
            });
        }

        // Si la suscripción está incompleta y requiere acción del usuario (3DS)
        if (subscription.status === 'incomplete' && subscription.latest_invoice && subscription.latest_invoice.payment_intent) {
            console.log('[CREATE_SUB] Suscripción incompleta, se requiere acción del usuario.');
            return res.json({
                subscriptionId: subscription.id,
                clientSecret: subscription.latest_invoice.payment_intent.client_secret,
                requiresAction: true,
            });
        }
        
        // Si llegamos aquí, es un estado inesperado
        console.error('[CREATE_SUB] FATAL: Estado de suscripción inesperado o falta de payment_intent.');
        return res.status(500).json({ error: 'Respuesta inesperada de Stripe al crear la suscripción.' });
        // --- FIN DE LA MODIFICACIÓN ---

    } catch (error) {
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