// autogest-app/backend/controllers/subscription/createSubscription.js
const { User } = require('../../models');
const { stripe, getStripeConfig } = require('./stripeConfig');

exports.createSubscription = async (req, res) => {
    console.log('[CREATE_SUB] Iniciando proceso de creación de suscripción (v5)...');
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
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice'], // Solo expandimos la factura, no el payment_intent anidado
        });
        
        console.log('[CREATE_SUB] Objeto de suscripción devuelto por Stripe:', JSON.stringify(subscription, null, 2));

        // --- INICIO DE LA MODIFICACIÓN ---
        let clientSecret;
        const latestInvoice = subscription.latest_invoice;

        if (subscription.status === 'incomplete' && latestInvoice && latestInvoice.payment_intent) {
            // El payment_intent puede ser un ID (string) o un objeto.
            const paymentIntentId = typeof latestInvoice.payment_intent === 'string'
                ? latestInvoice.payment_intent
                : latestInvoice.payment_intent.id;
            
            if (paymentIntentId) {
                console.log(`[CREATE_SUB] Obtenido Payment Intent ID: ${paymentIntentId}. Recuperándolo para obtener el client_secret.`);
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                clientSecret = paymentIntent.client_secret;
            } else {
                 console.log('[CREATE_SUB] El payment_intent en la factura es nulo, no se puede obtener el client_secret.');
            }
        }
        // --- FIN DE LA MODIFICACIÓN ---

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