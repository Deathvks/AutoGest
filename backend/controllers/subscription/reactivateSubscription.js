// autogest-app/backend/controllers/subscription/reactivateSubscription.js
const { User } = require('../../models');
const { stripe } = require('./stripeConfig');

exports.reactivateSubscription = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'Suscripción no encontrada.' });
        }

        // Buscamos la suscripción del usuario. Una suscripción marcada para cancelar
        // sigue teniendo el estado 'active' hasta que finaliza el período.
        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
            limit: 1
        });

        if (subscriptions.data.length === 0) {
            return res.status(404).json({ error: 'No se encontraron suscripciones activas para reactivar.' });
        }

        const subscription = subscriptions.data[0];

        // Verificamos si la suscripción está realmente marcada para cancelar
        if (!subscription.cancel_at_period_end) {
             return res.status(400).json({ error: 'La suscripción no está cancelada.' });
        }

        // Reactivamos la suscripción en Stripe eliminando la bandera de cancelación
        await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: false,
        });

        // Actualizamos el estado en nuestra base de datos local
        await user.update({ subscriptionStatus: 'active' });

        res.json({ message: 'Tu suscripción ha sido reactivada con éxito.' });
    } catch (error) {
        console.error('Error reactivando la suscripción:', error);
        res.status(500).json({ error: 'Error al reactivar la suscripción.' });
    }
};