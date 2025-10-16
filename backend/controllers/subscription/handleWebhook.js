// autogest-app/backend/controllers/subscription/handleWebhook.js
const { User, Notification } = require('../../models'); // Se añade Notification
const { stripe, getStripeConfig } = require('./stripeConfig');
const { sendSubscriptionInvoiceEmail } = require('../../utils/emailUtils');

exports.handleWebhook = async (req, res) => {
    console.log('[WEBHOOK] Petición recibida en el endpoint del webhook.');
    const sig = req.headers['stripe-signature'];
    const { webhookSecret } = getStripeConfig();

    console.log(`[WEBHOOK] ¿Cabecera 'stripe-signature' presente?: ${sig ? 'Sí' : 'No'}`);
    console.log(`[WEBHOOK] ¿'webhookSecret' cargado?: ${webhookSecret ? 'Sí' : 'No'}`);

    let event;

    try {
        // --- INICIO DE LA MODIFICACIÓN ---
        // Ahora usamos `req.body` que contiene el Buffer raw gracias a `express.raw()` en index.js
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        // --- FIN DE LA MODIFICACIÓN ---
    } catch (err) {
        console.error(`❌ Error en la firma del webhook: ${err.message}`);
        // Logueamos el cuerpo como texto para un diagnóstico más claro
        console.error('[WEBHOOK] Cuerpo de la petición que falló:', req.body.toString('utf8'));
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // A partir de aquí, el resto del código usa `event`, que ya está verificado
    // y contiene el payload parseado en `event.data.object`.
    const dataObject = event.data.object;
    console.log(`[Webhook] Evento verificado y recibido: ${event.type}`);

    try {
        let customerId;
        if (dataObject.object === 'customer') {
            customerId = dataObject.id;
        } else {
            customerId = dataObject.customer;
        }

        if (!customerId) {
            console.log(`[Webhook] Evento ${event.type} no contiene un customerId. Ignorando.`);
            return res.json({ received: true });
        }

        const user = await User.findOne({ where: { stripeCustomerId: customerId } });
        if (!user) {
            console.log(`[Webhook] Usuario no encontrado para customerId: ${customerId}.`);
            return res.json({ received: true });
        }

        switch (event.type) {
            case 'invoice.payment_succeeded':
                console.log('[Webhook] Datos de la factura:', {
                    status: dataObject.status,
                    invoice_pdf: dataObject.invoice_pdf ? 'Presente' : 'Ausente',
                    customer_email: dataObject.customer_email,
                    customer_name: dataObject.customer_name,
                    number: dataObject.number
                });

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
                        link: dataObject.invoice_pdf // Enlace directo a la factura
                    });
                    console.log(`[Webhook] Notificación de pago creada para el usuario ${user.id}.`);

                } else {
                    console.warn('[Webhook] No se pudo enviar la factura por email. Faltan datos clave o el estado no es "paid".');
                }
            
                if (dataObject.subscription) {
                    console.log(`[Webhook] Procesando pago exitoso de factura para suscripción: ${dataObject.subscription}`);
                    
                    try {
                        const subscription = await stripe.subscriptions.retrieve(dataObject.subscription);
                        console.log(`[Webhook] Estado de suscripción obtenido: ${subscription.status}`);
                        
                        if (subscription.status === 'active' || subscription.status === 'trialing') {
                            const expiryTimestamp = subscription.trial_end || subscription.current_period_end;

                            if (expiryTimestamp && !isNaN(expiryTimestamp)) {
                                const expiryDate = new Date(expiryTimestamp * 1000);
                                
                                if (!isNaN(expiryDate.getTime())) {
                                    const updatePayload = {
                                        subscriptionStatus: 'active',
                                        subscriptionExpiry: expiryDate,
                                    };
                                    if (user.role === 'user') {
                                        updatePayload.role = 'technician_subscribed';
                                    }
                                    await user.update(updatePayload);
                                    console.log(`✅ [Webhook] Suscripción activada para el usuario ${user.id}. Rol: ${user.role}, Expira: ${expiryDate.toISOString()}`);
                                } else {
                                    console.error(`[Webhook] Fecha de expiración inválida en invoice.payment_succeeded`);
                                    await user.update({ subscriptionStatus: 'active' });
                                    console.log(`⚠️ [Webhook] Usuario ${user.id} activado sin fecha de expiración`);
                                }
                            } else {
                                console.log(`[Webhook] current_period_end no disponible, solo actualizando status`);
                                await user.update({ subscriptionStatus: 'active' });
                                console.log(`⚠️ [Webhook] Usuario ${user.id} activado sin fecha de expiración`);
                            }
                        } else {
                            console.log(`[Webhook] Suscripción en estado: ${subscription.status}. No se actualiza el usuario.`);
                        }
                    } catch (subscriptionError) {
                        console.error(`[Webhook] Error al obtener datos de suscripción:`, subscriptionError);
                    }
                } else {
                    console.log(`[Webhook] Factura pagada sin suscripción asociada. Verificando si el usuario necesita actualización de fecha...`);
                    
                    try {
                        console.log(`[Webhook] Buscando suscripciones activas para customer: ${customerId}`);
                        const subscriptions = await stripe.subscriptions.list({
                            customer: customerId,
                            status: 'active',
                            limit: 10
                        });
                        
                        console.log(`[Webhook] Encontradas ${subscriptions.data.length} suscripciones activas`);
                        
                        if (subscriptions.data.length > 0) {
                            const subscription = subscriptions.data[0];
                            console.log(`[Webhook] Procesando suscripción: ${subscription.id}`);
                            console.log(`[Webhook] Datos completos de la suscripción:`, JSON.stringify({
                                id: subscription.id,
                                status: subscription.status,
                                current_period_start: subscription.current_period_start,
                                current_period_end: subscription.current_period_end,
                                created: subscription.created,
                                trial_end: subscription.trial_end,
                                billing_cycle_anchor: subscription.billing_cycle_anchor,
                                items: subscription.items.data.map(item => ({
                                    price: {
                                        id: item.price.id,
                                        recurring: item.price.recurring
                                    }
                                }))
                            }, null, 2));
                            
                            let expiryDate = null;
                            let dateSource = '';
                            
                            if (subscription.current_period_end && !isNaN(subscription.current_period_end)) {
                                expiryDate = new Date(subscription.current_period_end * 1000);
                                dateSource = 'current_period_end';
                            } 
                            else if (subscription.trial_end && !isNaN(subscription.trial_end)) {
                                expiryDate = new Date(subscription.trial_end * 1000);
                                dateSource = 'trial_end';
                            } 
                            else if (subscription.billing_cycle_anchor && !isNaN(subscription.billing_cycle_anchor)) {
                                const anchor = new Date(subscription.billing_cycle_anchor * 1000);
                                const interval = subscription.items.data[0]?.price?.recurring?.interval || 'month';
                                const intervalCount = subscription.items.data[0]?.price?.recurring?.interval_count || 1;
                                
                                if (interval === 'month') {
                                    const nextMonth = new Date(anchor);
                                    nextMonth.setMonth(nextMonth.getMonth() + intervalCount);
                                    expiryDate = nextMonth;
                                } else if (interval === 'year') {
                                    const nextYear = new Date(anchor);
                                    nextYear.setFullYear(nextYear.getFullYear() + intervalCount);
                                    expiryDate = nextYear;
                                } else if (interval === 'day') {
                                    const nextDays = new Date(anchor);
                                    nextDays.setDate(nextDays.getDate() + intervalCount);
                                    expiryDate = nextDays;
                                } else {
                                    expiryDate = new Date(anchor.getTime() + (30 * 24 * 60 * 60 * 1000));
                                }
                                dateSource = `calculated_from_billing_cycle_anchor_${interval}`;
                            } 
                            else if (subscription.created && !isNaN(subscription.created)) {
                                const created = new Date(subscription.created * 1000);
                                const interval = subscription.items.data[0]?.price?.recurring?.interval || 'month';
                                const intervalCount = subscription.items.data[0]?.price?.recurring?.interval_count || 1;
                                
                                if (interval === 'month') {
                                    const nextMonth = new Date(created);
                                    nextMonth.setMonth(nextMonth.getMonth() + intervalCount);
                                    expiryDate = nextMonth;
                                } else {
                                    expiryDate = new Date(created.getTime() + (30 * 24 * 60 * 60 * 1000));
                                }
                                dateSource = `calculated_from_created_${interval}`;
                            }
                            
                            console.log(`[Webhook] Fecha calculada desde ${dateSource}: ${expiryDate ? expiryDate.toISOString() : 'null'}`);
                            
                            if (expiryDate && !isNaN(expiryDate.getTime())) {
                                await user.update({ 
                                    subscriptionStatus: 'active',
                                    subscriptionExpiry: expiryDate 
                                });
                                console.log(`✅ [Webhook] Usuario ${user.id} actualizado. Status: active, Expira: ${expiryDate.toISOString()}`);
                            } else {
                                console.error(`[Webhook] No se pudo determinar ninguna fecha de expiración válida`);
                                await user.update({ subscriptionStatus: 'active' });
                                console.log(`⚠️ [Webhook] Usuario ${user.id} activado sin fecha de expiración`);
                            }
                        } else {
                            console.log(`[Webhook] No se encontraron suscripciones activas para el customer`);
                        }
                    } catch (error) {
                        console.error(`[Webhook] Error al buscar suscripciones:`, error);
                    }
                }
                break;

            case 'customer.subscription.created':
                console.log(`[Webhook] Nueva suscripción creada: ${dataObject.id}, status: ${dataObject.status}`);
                console.log(`[Webhook] current_period_end: ${dataObject.current_period_end}`);
                
                if (dataObject.status === 'active' || dataObject.status === 'trialing') {
                    const expiryTimestamp = dataObject.trial_end || dataObject.current_period_end;
                    if (expiryTimestamp && !isNaN(expiryTimestamp)) {
                        const expiryDate = new Date(expiryTimestamp * 1000);
                        
                        if (!isNaN(expiryDate.getTime())) {
                            const updatePayload = {
                                subscriptionStatus: 'active',
                                subscriptionExpiry: expiryDate,
                            };
                            if (user.role === 'user') {
                                updatePayload.role = 'technician_subscribed';
                            }
                            await user.update(updatePayload);
                            console.log(`✅ [Webhook] Usuario ${user.id} activado por nueva suscripción. Rol: ${user.role}, Expira: ${expiryDate.toISOString()}`);
                        } else {
                            console.error(`[Webhook] Fecha de expiración inválida para suscripción ${dataObject.id}`);
                            await user.update({ subscriptionStatus: 'active' });
                            console.log(`⚠️ [Webhook] Usuario ${user.id} activado sin fecha de expiración`);
                        }
                    } else {
                        console.log(`[Webhook] current_period_end no disponible para suscripción ${dataObject.id}, solo actualizando status`);
                        await user.update({ subscriptionStatus: 'active' });
                        console.log(`⚠️ [Webhook] Usuario ${user.id} activado sin fecha de expiración`);
                    }
                }
                break;

            case 'customer.subscription.updated':
                console.log(`[Webhook] Suscripción actualizada. Status: ${dataObject.status}, Cancel at period end: ${dataObject.cancel_at_period_end}`);
                
                if (dataObject.cancel_at_period_end) {
                    await user.update({ subscriptionStatus: 'cancelled' });
                    console.log(`[Webhook] Suscripción del usuario ${user.id} marcada para cancelación.`);
                } else if (dataObject.status === 'active' || dataObject.status === 'trialing') {
                    await user.update({ subscriptionStatus: 'active' });
                    console.log(`✅ [Webhook] Usuario ${user.id} reactivado. La fecha de expiración no cambia.`);
                } else if (dataObject.status === 'past_due') {
                    await user.update({ subscriptionStatus: 'past_due' });
                    console.log(`[Webhook] Suscripción del usuario ${user.id} marcada como past_due.`);
                }
                break;
            
            case 'customer.subscription.deleted':
                const updatePayload = { 
                    subscriptionStatus: 'inactive', 
                    subscriptionExpiry: null 
                };
                
                // Solo revierte el rol si era un 'technician_subscribed'.
                // No afecta a 'admin' o 'technician' normal.
                if (user.role === 'technician_subscribed') {
                    updatePayload.role = 'user';
                }

                await user.update(updatePayload);
                console.log(`[Webhook] Suscripción del usuario ${user.id} eliminada. Nuevo rol: ${user.role}.`);
                break;

            case 'invoice.payment_failed':
                console.log(`[Webhook] Pago de factura fallido para usuario ${user.id}`);
                if (dataObject.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(dataObject.subscription);
                    if (subscription.status === 'past_due') {
                        await user.update({ subscriptionStatus: 'past_due' });
                        console.log(`[Webhook] Usuario ${user.id} marcado como past_due por pago fallido.`);
                    }
                }
                break;
        }

    } catch (error) {
        console.error('[Webhook] Error al procesar el webhook:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json({ received: true });
};