// autogest-app/backend/controllers/subscription/createSubscription.js
const { User, Notification } = require('../../models');
const { stripe, getStripeConfig } = require('./stripeConfig');

// Función de utilidad para reintentar la obtención de la factura
const retrieveInvoiceWithRetry = async (invoiceId, retries = 5, delay = 500) => {
    for (let i = 0; i < retries; i++) {
        try {
            const invoice = await stripe.invoices.retrieve(invoiceId, {
                expand: ['payment_intent']
            });
            if (invoice.payment_intent && invoice.payment_intent.client_secret) {
                console.log(`[CREATE_SUB] Payment Intent encontrado en el intento ${i + 1}.`);
                return invoice;
            }
        } catch (error) {
            console.error(`[CREATE_SUB] Error recuperando factura en intento ${i + 1}:`, error.message);
        }
        
        const currentDelay = delay * Math.pow(2, i);
        console.log(`[CREATE_SUB] Intento ${i + 1} fallido (la factura aún no tiene PI). Esperando ${currentDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
    console.error(`[CREATE_SUB] No se pudo encontrar el PI para la factura ${invoiceId} después de ${retries} intentos.`);
    return null;
};

// Controlador principal
exports.createSubscription = async (req, res) => {
    console.log('[CREATE_SUB] Iniciando el proceso de creación de suscripciones (v19)...');
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

        // Lógica de "autocuración" con el orden de operaciones corregido (v19 Final)
        if (customerId) {
            try {
                // Paso 1: Adjuntar el método de pago al cliente.
                await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
                // Paso 2: Ahora sí, establecerlo como método de pago por defecto.
                await stripe.customers.update(customerId, {
                    invoice_settings: { default_payment_method: paymentMethodId },
                });
                console.log(`[CREATE_SUB] Método de pago asignado correctamente al cliente existente ${customerId}.`);
            } catch (error) {
                if (error.code === 'resource_missing') {
                    console.warn(`[CREATE_SUB] El cliente ${customerId} o sus datos son obsoletos. Creando un nuevo cliente desde cero.`);
                    const newCustomer = await stripe.customers.create({
                        email: user.email,
                        name: user.name,
                        payment_method: paymentMethodId,
                        invoice_settings: { default_payment_method: paymentMethodId },
                    });
                    
                    customerId = newCustomer.id;
                    await user.update({ stripeCustomerId: customerId });
                    console.log(`[CREATE_SUB] Nuevo cliente ${customerId} autocreado y método de pago asignado.`);
                } else {
                    throw error;
                }
            }
        } else {
            const newCustomer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                payment_method: paymentMethodId,
                invoice_settings: { default_payment_method: paymentMethodId },
            });
            customerId = newCustomer.id;
            await user.update({ stripeCustomerId: customerId });
            console.log(`[CREATE_SUB] Nuevo cliente ${customerId} creado por primera vez.`);
        }

        const now = new Date();
        const firstOfNextMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));
        const anchorTimestamp = Math.floor(firstOfNextMonth.getTime() / 1000);

        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            billing_cycle_anchor: anchorTimestamp,
            proration_behavior: 'create_prorations',
        });

        if (subscription.status === 'active') {
            // --- INICIO DE LA MODIFICACIÓN ---
            // Crear la notificación para el usuario cuando la suscripción se activa inmediatamente
            await Notification.create({
                userId: user.id,
                message: 'Tu suscripción ha sido activada con éxito.',
                type: 'subscription'
            });
            // --- FIN DE LA MODIFICACIÓN ---
            return res.json({ status: 'active' });
        }
        
        if (subscription.status === 'incomplete' && subscription.latest_invoice) {
            const invoice = await retrieveInvoiceWithRetry(subscription.latest_invoice);
            
            if (invoice && invoice.payment_intent && invoice.payment_intent.client_secret) {
                return res.json({
                    subscriptionId: subscription.id,
                    clientSecret: invoice.payment_intent.client_secret,
                    requiresAction: true,
                });
            }
        }

        console.error('[CREATE_SUB] FATAL: No se pudo obtener el client_secret para la suscripción.');
        return res.status(500).json({ error: 'Respuesta inesperada de Stripe. No se pudo iniciar el pago.' });

    } catch (error) {
        console.error('--- ERROR DETALLADO EN CREATE_SUB ---', error);
        res.status(500).json({ error: error.message || 'Error al crear la suscripción.' });
    }
};