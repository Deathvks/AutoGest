// autogest-app/backend/controllers/subscription/getSubscriptionStatus.js
const { User } = require('../../models');

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