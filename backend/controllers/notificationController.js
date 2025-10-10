// autogest-app/backend/controllers/notificationController.js
const { Notification } = require('../models');

// Obtener todas las notificaciones del usuario logueado
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50 // Limitar a las 50 más recientes para no sobrecargar
        });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ error: 'Error al obtener las notificaciones.' });
    }
};

// Marcar todas las notificaciones del usuario como leídas
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { userId: req.user.id, isRead: false } }
        );
        res.status(200).json({ message: 'Todas las notificaciones han sido marcadas como leídas.' });
    } catch (error) {
        console.error('Error al marcar notificaciones como leídas:', error);
        res.status(500).json({ error: 'Error al actualizar las notificaciones.' });
    }
};