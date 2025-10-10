// autogest-app/backend/controllers/subscription/reactivateSubscription.js
const { User, Notification } = require('../../models'); // Se añade Notification
const { stripe } = require('./stripeConfig');

exports.reactivateSubscription = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'Suscripción no encontrada.' });
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
            limit: 1
        });

        if (subscriptions.data.length === 0) {
            return res.status(404).json({ error: 'No se encontraron suscripciones activas para reactivar.' });
        }

        const subscription = subscriptions.data[0];

        if (!subscription.cancel_at_period_end) {
             return res.status(400).json({ error: 'La suscripción no está cancelada.' });
        }

        await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: false,
        });

        await user.update({ subscriptionStatus: 'active' });

        // --- INICIO DE LA MODIFICACIÓN ---
        // Crear la notificación para el usuario
        await Notification.create({
            userId: user.id,
            message: 'Tu suscripción ha sido reactivada con éxito.',
            type: 'subscription'
        });
        // --- FIN DE LA MODIFICACIÓN ---

        res.json({ message: 'Tu suscripción ha sido reactivada con éxito.' });
    } catch (error) {
        console.error('Error reactivando la suscripción:', error);
        res.status(500).json({ error: 'Error al reactivar la suscripción.' });
    }
};