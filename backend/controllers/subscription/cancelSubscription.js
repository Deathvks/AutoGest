// autog-est-app/backend/controllers/subscription/cancelSubscription.js
const { User } = require('../../models');
const { stripe } = require('./stripeConfig');

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