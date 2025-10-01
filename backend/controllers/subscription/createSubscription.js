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
            console.error('[CREATE_SUB] Error: No se proporcionó un paymentMethodId.');
            return res.status(400).json({ error: 'No se proporcionó un método de pago.' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            console.error(`[CREATE_SUB] Error: Usuario con ID ${userId} no encontrado.`);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        console.log(`[CREATE_SUB] Usuario encontrado: ${user.email}`);

        let customerId = user.stripeCustomerId;

        if (!customerId) {
            console.log('[CREATE_SUB] Usuario sin customerId de Stripe. Creando uno nuevo...');
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
            console.log(`[CREATE_SUB] Nuevo customerId de Stripe creado y guardado: ${customerId}`);
        } else {
            console.log(`[CREATE_SUB] El usuario ya tiene un customerId: ${customerId}. Adjuntando nuevo método de pago...`);
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
            console.log('[CREATE_SUB] Método de pago adjuntado. Actualizando método de pago por defecto...');
            await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
            console.log('[CREATE_SUB] Método de pago por defecto actualizado.');
        }

        console.log(`[CREATE_SUB] Intentando crear suscripción para customer ${customerId} con price ${priceId}...`);
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'error_if_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        console.log(`[CREATE_SUB] Suscripción creada con éxito. ID: ${subscription.id}`);
        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });

    } catch (error) {
        // --- INICIO DE LA MODIFICACIÓN ---
        if (error.code === 'subscription_payment_intent_requires_action' && error.raw && error.raw.payment_intent) {
            console.log('[CREATE_SUB] Se requiere acción del cliente. Enviando client_secret al frontend...');
            return res.json({
                clientSecret: error.raw.payment_intent.client_secret,
            });
        }
        // --- FIN DE LA MODIFICACIÓN ---

        console.error('--- ERROR DETALLADO EN CREATE_SUB ---');
        console.error('Mensaje:', error.message);
        console.error('Tipo:', error.type);
        console.error('Código:', error.code);
        console.error('Stack:', error.stack);
        console.error("------------------------------------");
        res.status(500).json({ error: error.message || 'Error al crear la suscripción. Por favor, revisa los logs del servidor.' });
    }
};