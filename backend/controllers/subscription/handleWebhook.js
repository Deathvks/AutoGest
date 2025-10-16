// autogest-app/backend/controllers/subscription/handleWebhook.js
const { User, Notification } = require('../../models'); // Se añade Notification
const { stripe, getStripeConfig } = require('./stripeConfig');
const { sendSubscriptionInvoiceEmail } = require('../../utils/emailUtils');

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const { webhookSecret } = getStripeConfig();
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error(`❌ Error en la firma del webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const dataObject = event.data.object;
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se mantiene un único log para saber qué evento se está procesando.
    console.log(`[WEBHOOK] Evento recibido y verificado: ${event.type}`);
    // --- FIN DE LA MODIFICACIÓN ---

    try {
        const customerId = dataObject.customer;

        if (!customerId) {
            // Este log es útil para ignorar eventos sin cliente.
            console.log(`[WEBHOOK] Evento ${event.type} sin customerId. Ignorando.`);
            return res.json({ received: true });
        }

        const user = await User.findOne({ where: { stripeCustomerId: customerId } });
        if (!user) {
            console.warn(`[WEBHOOK] Usuario no encontrado para customerId: ${customerId}.`);
            return res.json({ received: true });
        }

        switch (event.type) {
            case 'invoice.payment_succeeded':
                if (dataObject.status === 'paid' && dataObject.invoice_pdf && dataObject.customer_email) {
                    await sendSubscriptionInvoiceEmail(
                        dataObject.customer_email,
                        dataObject.customer_name || user.name,
                        dataObject.invoice_pdf,
                        dataObject.number
                    );
                    await Notification.create({
                        userId: user.id,
                        message: 'Tu pago de suscripción se ha procesado con éxito.',
                        type: 'subscription',
                        link: dataObject.invoice_pdf
                    });
                }
            
                if (dataObject.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(dataObject.subscription);
                    if (subscription.status === 'active' || subscription.status === 'trialing') {
                        const expiryTimestamp = subscription.trial_end || subscription.current_period_end;
                        if (expiryTimestamp) {
                            const expiryDate = new Date(expiryTimestamp * 1000);
                            const updatePayload = {
                                subscriptionStatus: 'active',
                                subscriptionExpiry: expiryDate,
                            };
                            if (user.role === 'user') {
                                updatePayload.role = 'technician_subscribed';
                            }
                            await user.update(updatePayload);
                            // --- INICIO DE LA MODIFICACIÓN ---
                            // Log clave que confirma la activación/actualización.
                            console.log(`✅ [WEBHOOK] Suscripción activada para usuario ${user.id}. Expira: ${expiryDate.toISOString()}`);
                            // --- FIN DE LA MODIFICACIÓN ---
                        }
                    }
                }
                break;

            case 'customer.subscription.updated':
                if (dataObject.cancel_at_period_end) {
                    await user.update({ subscriptionStatus: 'cancelled' });
                    // --- INICIO DE LA MODIFICACIÓN ---
                    // Log clave que confirma la cancelación.
                    console.log(`🔔 [WEBHOOK] Suscripción de usuario ${user.id} marcada para cancelar al final del período.`);
                    // --- FIN DE LA MODIFICACIÓN ---
                } else if (dataObject.status === 'active') {
                    await user.update({ subscriptionStatus: 'active' });
                     // --- INICIO DE LA MODIFICACIÓN ---
                    // Log clave que confirma la reactivación.
                    console.log(`✅ [WEBHOOK] Suscripción de usuario ${user.id} ha sido reactivada.`);
                    // --- FIN DE LA MODIFICACIÓN ---
                } else if (dataObject.status === 'past_due') {
                    await user.update({ subscriptionStatus: 'past_due' });
                    // --- INICIO DE LA MODIFICACIÓN ---
                    // Log clave para problemas de pago.
                    console.warn(`⚠️ [WEBHOOK] Suscripción de usuario ${user.id} marcada como "past_due".`);
                    // --- FIN DE LA MODIFICACIÓN ---
                }
                break;
            
            case 'customer.subscription.deleted':
                const updatePayload = { 
                    subscriptionStatus: 'inactive', 
                    subscriptionExpiry: null 
                };
                if (user.role === 'technician_subscribed') {
                    updatePayload.role = 'user';
                }
                await user.update(updatePayload);
                // --- INICIO DE LA MODIFICACIÓN ---
                // Log clave que confirma la eliminación final.
                console.log(`🗑️ [WEBHOOK] Suscripción de usuario ${user.id} eliminada. Rol revertido a ${updatePayload.role || user.role}.`);
                // --- FIN DE LA MODIFICACIÓN ---
                break;

            case 'invoice.payment_failed':
                await user.update({ subscriptionStatus: 'past_due' });
                await Notification.create({
                    userId: user.id,
                    message: 'Hubo un problema al procesar el pago de tu suscripción. Por favor, actualiza tu método de pago.',
                    type: 'subscription'
                });
                // --- INICIO DE LA MODIFICACIÓN ---
                // Log de error importante.
                console.error(`❌ [WEBHOOK] Fallo en el pago para el usuario ${user.id}. Estado cambiado a "past_due".`);
                // --- FIN DE LA MODIFICACIÓN ---
                break;
        }

    } catch (error) {
        console.error('[Webhook] Error al procesar el webhook:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json({ received: true });
};