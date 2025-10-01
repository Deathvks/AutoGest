// autogest-app/backend/controllers/subscription/createSubscription.js
const { User } = require('../../models');
const { stripe, getStripeConfig } = require('./stripeConfig');

exports.createSubscription = async (req, res) => {
    console.log('[CREATE_SUB] Iniciando proceso de creación de suscripción (v2)...');
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
        // Modificamos el 'payment_behavior' para que no falle si se necesita autenticación.
        // La suscripción se creará en estado 'incomplete'.
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete', // CAMBIO CLAVE
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });
        
        console.log(`[CREATE_SUB] Suscripción creada con ID: ${subscription.id} y estado: ${subscription.status}`);

        const paymentIntent = subscription.latest_invoice.payment_intent;

        // Si el pago requiere acción del usuario, enviamos el client_secret.
        if (paymentIntent && paymentIntent.status === 'requires_action') {
            console.log(`[CREATE_SUB] El pago requiere acción. Enviando client_secret.`);
            res.json({
                subscriptionId: subscription.id,
                clientSecret: paymentIntent.client_secret,
            });
        } 
        // Si el pago se ha completado con éxito directamente.
        else if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log('[CREATE_SUB] El pago se completó con éxito sin acción adicional.');
            res.json({
                subscriptionId: subscription.id,
                clientSecret: null, // No se necesita acción.
            });
        } 
        // Si la suscripción no requiere pago inmediato (ej. prueba gratuita).
        else if (subscription.status === 'active' || subscription.status === 'trialing') {
             console.log('[CREATE_SUB] La suscripción está activa y no requiere pago inmediato.');
             res.json({
                subscriptionId: subscription.id,
                clientSecret: null,
            });
        }
        else {
            // Manejar otros estados inesperados
            console.error(`[CREATE_SUB] Estado inesperado de la suscripción o PaymentIntent: sub=${subscription.status}, pi=${paymentIntent?.status}`);
            throw new Error('Estado inesperado de la suscripción.');
        }
        // --- FIN DE LA MODIFICACIÓN ---

    } catch (error) {
        console.error('--- ERROR DETALLADO EN CREATE_SUB ---');
        console.error('Mensaje:', error.message);
        console.error('Tipo:', error.type);
        console.error('Código:', error.code);
        console.error('Stack:', error.stack);
        console.error("------------------------------------");
        res.status(500).json({ error: error.message || 'Error al procesar la suscripción.' });
    }
};
