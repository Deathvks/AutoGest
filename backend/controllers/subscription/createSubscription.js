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

        let subscription;
        try {
            subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                default_payment_method: paymentMethodId,
                payment_behavior: 'error_if_incomplete',
                payment_settings: {
                    save_default_payment_method: 'on_subscription',
                },
                expand: ['latest_invoice.payment_intent'],
            });
        } catch (stripeError) {
            // --- INICIO DE LA MODIFICACIÓN ---
            // Se maneja el error específico cuando se requiere 3D Secure.
            if (stripeError.code === 'subscription_payment_intent_requires_action') {
                console.log('[CREATE_SUB] Pago requiere autenticación adicional (3D Secure).');
                
                // Extraemos el ID del PaymentIntent del objeto de error que nos envía Stripe.
                const paymentIntentId = stripeError.raw?.payment_intent?.id;

                if (paymentIntentId) {
                    // Recuperamos el PaymentIntent completo para obtener su client_secret.
                    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

                    // Enviamos al frontend la información necesaria para que el usuario pueda autenticar el pago.
                    return res.json({
                        subscriptionId: stripeError.raw.subscription, // ID de la suscripción incompleta
                        clientSecret: paymentIntent.client_secret, // Secreto para confirmar el pago en el frontend
                        requiresAction: true,
                    });
                }
            }
            // --- FIN DE LA MODIFICACIÓN ---

            // Si llegamos aquí, es otro tipo de error
            throw stripeError;
        }

        console.log('[CREATE_SUB] Objeto de suscripción devuelto por Stripe:', JSON.stringify(subscription, null, 2));

        let clientSecret;
        const latestInvoice = subscription.latest_invoice;

        if (latestInvoice && latestInvoice.payment_intent) {
            if (typeof latestInvoice.payment_intent === 'object' && latestInvoice.payment_intent.client_secret) {
                console.log('[CREATE_SUB] client_secret obtenido directamente de la expansión.');
                clientSecret = latestInvoice.payment_intent.client_secret;
            } else if (typeof latestInvoice.payment_intent === 'string') {
                console.log('[CREATE_SUB] payment_intent es un ID, recuperándolo...');
                const paymentIntent = await stripe.paymentIntents.retrieve(latestInvoice.payment_intent);
                clientSecret = paymentIntent.client_secret;
            }
        }

        // Si el pago fue exitoso inmediatamente, puede que no haya client_secret
        if (!clientSecret && subscription.status === 'active') {
            console.log('[CREATE_SUB] Suscripción activada inmediatamente sin necesidad de confirmación adicional.');
            return res.json({
                subscriptionId: subscription.id,
                status: 'active',
                clientSecret: null,
            });
        }

        if (!clientSecret) {
            console.error('[CREATE_SUB] FATAL: No se pudo obtener el client_secret de Stripe.');
            return res.status(500).json({ error: 'No se pudo obtener la información de pago necesaria de Stripe.' });
        }

        console.log(`[CREATE_SUB] Suscripción creada con ID: ${subscription.id} y estado: ${subscription.status}`);

        res.json({
            subscriptionId: subscription.id,
            clientSecret: clientSecret,
        });

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