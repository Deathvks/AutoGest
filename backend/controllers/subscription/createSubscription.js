// autogest-app/backend/controllers/subscription/createSubscription.js
const { User } = require('../../models');
const { stripe, getStripeConfig } = require('./stripeConfig');

exports.createSubscription = async (req, res) => {
    console.log('[CREATE_SUB] Iniciando processo de criação de subscrição (v5)...');
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
            // --- INICIO DE LA MODIFICACIÓN ---
            // Añadimos explícitamente el método de pago a la suscripción.
            default_payment_method: paymentMethodId,
            // --- FIN DE LA MODIFICACIÓN ---
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });
        
        console.log('[CREATE_SUB] Objeto de suscripción devuelto por Stripe:', JSON.stringify(subscription, null, 2));

        let clientSecret;
        const latestInvoice = subscription.latest_invoice;

        if (latestInvoice && latestInvoice.payment_intent && typeof latestInvoice.payment_intent === 'object' && latestInvoice.payment_intent.client_secret) {
            console.log('[CREATE_SUB] client_secret obtenido directamente de la expansión de la suscripción.');
            clientSecret = latestInvoice.payment_intent.client_secret;
        } 
        else if (latestInvoice && (typeof latestInvoice === 'object' && latestInvoice.id) || typeof latestInvoice === 'string') {
            const invoiceId = typeof latestInvoice === 'string' ? latestInvoice : latestInvoice.id;
            console.log(`[CREATE_SUB] La expansión falló o no estaba presente. Obteniendo la factura ${invoiceId} por separado.`);
            
            const retrievedInvoice = await stripe.invoices.retrieve(
                invoiceId,
                { expand: ['payment_intent'] }
            );

            console.log('[CREATE_SUB] Objeto de factura recuperado:', JSON.stringify(retrievedInvoice, null, 2));

            if (retrievedInvoice.payment_intent && retrievedInvoice.payment_intent.client_secret) {
                console.log('[CREATE_SUB] client_secret obtenido de la recuperación de la factura por separado.');
                clientSecret = retrievedInvoice.payment_intent.client_secret;
            } else {
                console.log('[CREATE_SUB] No se encontró el payment_intent incluso después de recuperar la factura por separado.');
            }
        } else {
            console.log('[CREATE_SUB] No se encontró un objeto latest_invoice o un ID de factura en la respuesta de la suscripción.');
        }

        if (!clientSecret) {
            console.error('[CREATE_SUB] FATAL: No se pudo obtener el client_secret de Stripe después de todos los intentos.');
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