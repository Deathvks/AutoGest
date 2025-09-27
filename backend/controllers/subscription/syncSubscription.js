// autogest-app/backend/controllers/subscription/syncSubscription.js
const { User } = require('../../models');
const { stripe } = require('./stripeConfig');

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
            
            let expiryDate = null;
            if (subscription.current_period_end) {
                expiryDate = new Date(subscription.current_period_end * 1000);
            } else {
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