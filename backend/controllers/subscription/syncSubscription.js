// autogest-app/backend/controllers/subscription/syncSubscription.js
const { User } = require('../../models');
const { stripe } = require('./stripeConfig');

exports.syncSubscription = async (req, res) => {
    // --- INICIO DE LA MODIFICACIÓN ---
    console.log('[SYNC] Iniciando sincronización manual de suscripción...');
    // --- FIN DE LA MODIFICACIÓN ---
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'Usuario sin customer ID de Stripe' });
        }
        
        console.log(`[SYNC] Buscando suscripciones para el customer: ${user.stripeCustomerId}`);
        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
            limit: 1
        });

        if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            console.log(`[SYNC] Suscripción activa encontrada: ${subscription.id}`);
            
            const expiryDate = new Date(subscription.current_period_end * 1000);
            const updatePayload = {
                subscriptionStatus: 'active',
                subscriptionExpiry: expiryDate,
            };

            if (user.role === 'user') {
                updatePayload.role = 'technician_subscribed';
            }
            
            await user.update(updatePayload);
            
            console.log(`[SYNC] Usuario ${user.id} actualizado a estado 'active'.`);
            res.json({ 
                message: 'Suscripción sincronizada',
                subscriptionStatus: 'active',
                subscriptionExpiry: expiryDate
            });
        } else {
            console.log(`[SYNC] No se encontraron suscripciones activas para el customer ${user.stripeCustomerId}.`);
            res.status(404).json({ error: 'No se encontraron suscripciones activas' });
        }
    } catch (error) {
        console.error('[SYNC] Error sincronizando:', error);
        res.status(500).json({ error: 'Error interno al sincronizar' });
    }
};