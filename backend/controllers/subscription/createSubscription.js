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
            // --- INICIO DE LA MODIFICACIÓN ---
            subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                default_payment_method: paymentMethodId,
                payment_behavior: 'default_incomplete', // CAMBIO CLAVE: Permite flujos de autenticación
                payment_settings: {
                    save_default_payment_method: 'on_subscription',
                },
                expand: ['latest_invoice.payment_intent'],
            });
            // --- FIN DE LA MODIFICACIÓN ---
        } catch (stripeError) {
            // Este bloque catch ahora solo se activará para errores inesperados,
            // ya que 'default_incomplete' no lanza error por requerir acción.
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

        // Si el pago fue exitoso inmediatamente (status: 'active')
        if (subscription.status === 'active') {
            console.log('[CREATE_SUB] Suscripción activada inmediatamente sin necesidad de confirmación adicional.');
            return res.json({
                subscriptionId: subscription.id,
                status: 'active',
                clientSecret: null,
            });
        }

        // Si la suscripción está incompleta (requiere acción)
        if (subscription.status === 'incomplete' && clientSecret) {
             console.log(`[CREATE_SUB] Suscripción creada con ID: ${subscription.id} y estado: ${subscription.status}. Requiere acción.`);
             return res.json({
                subscriptionId: subscription.id,
                clientSecret: clientSecret,
                requiresAction: true,
            });
        }

        // Fallback por si algo inesperado ocurre
        if (!clientSecret) {
            console.error('[CREATE_SUB] FATAL: No se pudo obtener el client_secret de Stripe para una suscripción incompleta.');
            return res.status(500).json({ error: 'No se pudo obtener la información de pago necesaria de Stripe.' });
        }


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