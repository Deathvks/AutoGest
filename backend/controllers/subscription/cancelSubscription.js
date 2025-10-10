// autogest-app/backend/controllers/subscription/cancelSubscription.js
const { User, Notification } = require('../../models'); // Se añade Notification
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

        // --- INICIO DE LA MODIFICACIÓN ---
        // Se guarda la suscripción actualizada para obtener la fecha de finalización
        const subscription = await stripe.subscriptions.update(subscriptions.data[0].id, {
            cancel_at_period_end: true,
        });

        await user.update({ subscriptionStatus: 'cancelled' });

        // Crear la notificación para el usuario
        if (subscription.current_period_end) {
            const expiryDate = new Date(subscription.current_period_end * 1000);
            const formattedDate = expiryDate.toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            await Notification.create({
                userId: user.id,
                message: `Tu suscripción ha sido cancelada y finalizará el ${formattedDate}.`,
                type: 'subscription'
            });
        }
        // --- FIN DE LA MODIFICACIÓN ---

        res.json({ message: 'Tu suscripción se cancelará al final del período de facturación actual.' });
    } catch (error) {
        console.error('Error cancelando suscripción:', error);
        res.status(500).json({ error: 'Error al cancelar la suscripción' });
    }
};