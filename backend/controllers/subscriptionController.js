// autogest-app/backend/controllers/subscriptionController.js
const { User } = require('../models');

const stripe = require('stripe')(
    process.env.NODE_ENV === 'production'
        ? process.env.STRIPE_SECRET_KEY_LIVE
        : process.env.STRIPE_SECRET_KEY_TEST
);

const getStripeConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        priceId: isProduction ? process.env.STRIPE_PRICE_ID_LIVE : process.env.STRIPE_PRICE_ID_TEST,
        webhookSecret: isProduction ? process.env.STRIPE_WEBHOOK_SECRET_LIVE : process.env.STRIPE_WEBHOOK_SECRET_TEST,
    };
};

exports.createSubscription = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        const userId = req.user.id;
        const { priceId } = getStripeConfig();
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
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            customerId = customer.id;
            await user.update({ stripeCustomerId: customerId });
        } else {
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
            await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
        }

        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'error_if_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });

    } catch (error) {
        console.error('Error creando suscripción:', error);
        res.status(500).json({ error: 'Error al crear la suscripción' });
    }
};

exports.getSubscriptionStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({
            subscriptionStatus: user.subscriptionStatus,
            subscriptionExpiry: user.subscriptionExpiry,
        });
    } catch (error) {
        console.error('Error verificando suscripción:', error);
        res.status(500).json({ error: 'Error al verificar la suscripción' });
    }
};

exports.cancelSubscription = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'Suscripción no encontrada' });
        }
        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
            limit: 1
        });
        if (subscriptions.data.length === 0) {
            return res.status(404).json({ error: 'No se encontraron suscripciones activas.' });
        }
        await stripe.subscriptions.update(subscriptions.data[0].id, {
            cancel_at_period_end: true,
        });
        await user.update({ subscriptionStatus: 'cancelled' });
        res.json({ message: 'Tu suscripción se cancelará al final del período de facturación actual.' });
    } catch (error) {
        console.error('Error cancelando suscripción:', error);
        res.status(500).json({ error: 'Error al cancelar la suscripción' });
    }
};

// Updated webhook handler with improved logic
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
    console.log(`[Webhook] Evento recibido: ${event.type}`);

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
                // Improved logic for invoice payment success
                if (dataObject.subscription) {
                    console.log(`[Webhook] Procesando pago exitoso de factura para suscripción: ${dataObject.subscription}`);
                    
                    try {
                        // Always fetch the fresh subscription data
                        const subscription = await stripe.subscriptions.retrieve(dataObject.subscription);
                        console.log(`[Webhook] Estado de suscripción obtenido: ${subscription.status}`);
                        
                        // Update user if subscription is active or trialing
                        if (subscription.status === 'active' || subscription.status === 'trialing') {
                            // Validate that current_period_end exists and is valid
                            if (subscription.current_period_end && !isNaN(subscription.current_period_end)) {
                                const expiryDate = new Date(subscription.current_period_end * 1000);
                                
                                // Double check the date is valid
                                if (!isNaN(expiryDate.getTime())) {
                                    await user.update({
                                        subscriptionStatus: 'active',
                                        subscriptionExpiry: expiryDate,
                                    });
                                    console.log(`✅ [Webhook] Suscripción activada para el usuario ${user.id}. Estado: ${subscription.status}, Expira: ${expiryDate.toISOString()}`);
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
                    
                    // Intentamos obtener las suscripciones activas del cliente
                    try {
                        console.log(`[Webhook] Buscando suscripciones activas para customer: ${customerId}`);
                        const subscriptions = await stripe.subscriptions.list({
                            customer: customerId,
                            status: 'active',
                            limit: 10
                        });
                        
                        console.log(`[Webhook] Encontradas ${subscriptions.data.length} suscripciones activas`);
                        
                        if (subscriptions.data.length > 0) {
                            // Tomamos la suscripción más reciente
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
                            
                            // Intentar múltiples formas de obtener la fecha de expiración
                            let expiryDate = null;
                            let dateSource = '';
                            
                            // PRIORIDAD 1: current_period_end (más preciso)
                            if (subscription.current_period_end && !isNaN(subscription.current_period_end)) {
                                expiryDate = new Date(subscription.current_period_end * 1000);
                                dateSource = 'current_period_end';
                            } 
                            // PRIORIDAD 2: trial_end si existe
                            else if (subscription.trial_end && !isNaN(subscription.trial_end)) {
                                expiryDate = new Date(subscription.trial_end * 1000);
                                dateSource = 'trial_end';
                            } 
                            // PRIORIDAD 3: billing_cycle_anchor + intervalo de facturación
                            else if (subscription.billing_cycle_anchor && !isNaN(subscription.billing_cycle_anchor)) {
                                const anchor = new Date(subscription.billing_cycle_anchor * 1000);
                                // Usar el intervalo real del precio en lugar de asumir 30 días
                                const interval = subscription.items.data[0]?.price?.recurring?.interval || 'month';
                                const intervalCount = subscription.items.data[0]?.price?.recurring?.interval_count || 1;
                                
                                if (interval === 'month') {
                                    // Calcular meses correctamente
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
                                    // Fallback a 30 días si no reconocemos el intervalo
                                    expiryDate = new Date(anchor.getTime() + (30 * 24 * 60 * 60 * 1000));
                                }
                                dateSource = `calculated_from_billing_cycle_anchor_${interval}`;
                            } 
                            // PRIORIDAD 4: created + intervalo (último recurso)
                            else if (subscription.created && !isNaN(subscription.created)) {
                                const created = new Date(subscription.created * 1000);
                                const interval = subscription.items.data[0]?.price?.recurring?.interval || 'month';
                                const intervalCount = subscription.items.data[0]?.price?.recurring?.interval_count || 1;
                                
                                if (interval === 'month') {
                                    const nextMonth = new Date(created);
                                    nextMonth.setMonth(nextMonth.getMonth() + intervalCount);
                                    expiryDate = nextMonth;
                                } else {
                                    // Fallback simple
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
                // Handle new subscription creation
                console.log(`[Webhook] Nueva suscripción creada: ${dataObject.id}, status: ${dataObject.status}`);
                console.log(`[Webhook] current_period_end: ${dataObject.current_period_end}`);
                
                if (dataObject.status === 'active' || dataObject.status === 'trialing') {
                    // Validate that current_period_end exists and is valid
                    if (dataObject.current_period_end && !isNaN(dataObject.current_period_end)) {
                        const expiryDate = new Date(dataObject.current_period_end * 1000);
                        
                        // Double check the date is valid
                        if (!isNaN(expiryDate.getTime())) {
                            await user.update({
                                subscriptionStatus: 'active',
                                subscriptionExpiry: expiryDate,
                            });
                            console.log(`✅ [Webhook] Usuario ${user.id} activado por nueva suscripción. Expira: ${expiryDate.toISOString()}`);
                        } else {
                            console.error(`[Webhook] Fecha de expiración inválida para suscripción ${dataObject.id}`);
                            // Still update status without expiry date
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
                    // Validate that current_period_end exists and is valid
                    if (dataObject.current_period_end && !isNaN(dataObject.current_period_end)) {
                        const expiryDate = new Date(dataObject.current_period_end * 1000);
                        
                        // Double check the date is valid
                        if (!isNaN(expiryDate.getTime())) {
                            await user.update({
                                subscriptionStatus: 'active',
                                subscriptionExpiry: expiryDate,
                            });
                            console.log(`✅ [Webhook] Suscripción del usuario ${user.id} reactivada. Expira: ${expiryDate.toISOString()}`);
                        } else {
                            console.error(`[Webhook] Fecha de expiración inválida en subscription.updated`);
                            await user.update({ subscriptionStatus: 'active' });
                            console.log(`⚠️ [Webhook] Usuario ${user.id} reactivado sin fecha de expiración`);
                        }
                    } else {
                        console.log(`[Webhook] current_period_end no disponible en subscription.updated`);
                        await user.update({ subscriptionStatus: 'active' });
                        console.log(`⚠️ [Webhook] Usuario ${user.id} reactivado sin fecha de expiración`);
                    }
                } else if (dataObject.status === 'past_due') {
                    await user.update({ subscriptionStatus: 'past_due' });
                    console.log(`[Webhook] Suscripción del usuario ${user.id} marcada como past_due.`);
                }
                break;
            
            case 'customer.subscription.deleted':
                await user.update({ subscriptionStatus: 'inactive', subscriptionExpiry: null });
                console.log(`[Webhook] Suscripción del usuario ${user.id} eliminada y marcada como inactiva.`);
                break;

            case 'invoice.payment_failed':
                // Handle failed payments
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

// En subscriptionController.js
exports.syncSubscription = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'Usuario sin customer ID de Stripe' });
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
            limit: 1
        });

        if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            console.log('Sync - Datos de suscripción:', JSON.stringify(subscription, null, 2));
            
            // Usar la misma lógica que en el webhook
            let expiryDate = null;
            if (subscription.current_period_end) {
                expiryDate = new Date(subscription.current_period_end * 1000);
            } else {
                // Calcular un mes desde ahora
                expiryDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
            }
            
            await user.update({
                subscriptionStatus: 'active',
                subscriptionExpiry: expiryDate,
            });
            
            res.json({ 
                message: 'Suscripción sincronizada',
                subscriptionStatus: 'active',
                subscriptionExpiry: expiryDate
            });
        } else {
            res.status(404).json({ error: 'No se encontraron suscripciones activas' });
        }
    } catch (error) {
        console.error('Error sincronizando:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};
// --- FIN DE LA MODIFICACIÓN ---