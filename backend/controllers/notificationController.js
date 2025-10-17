// autogest-app/backend/controllers/notificationController.js
const { Notification, User, Company } = require('../models');

// Obtener todas las notificaciones del usuario logueado
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50
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

// Crear una notificación para el líder del equipo cuando un miembro crea un coche
exports.createCarCreationNotification = async (req, res) => {
    const { carId, message } = req.body;
    const { companyId } = req.user;

    if (!companyId) {
        return res.status(200).json({ message: 'El usuario no pertenece a una compañía, no se envía notificación.' });
    }

    try {
        // --- INICIO DE LA MODIFICACIÓN ---
        // 1. Encontrar la compañía para obtener el ownerId
        const company = await Company.findByPk(companyId);

        if (!company) {
            console.log(`No se encontró una compañía con ID ${companyId}, no se puede notificar.`);
            return res.status(404).json({ error: 'No se encontró el equipo.' });
        }

        // 2. Usar el ownerId para encontrar al usuario propietario
        const owner = await User.findByPk(company.ownerId);
        // --- FIN DE LA MODIFICACIÓN ---

        if (!owner) {
            console.log(`No se encontró un propietario para la compañía ${companyId}, no se puede notificar.`);
            return res.status(404).json({ error: 'No se encontró el propietario del equipo.' });
        }

        const notification = await Notification.create({
            userId: owner.id,
            message: message,
            type: 'car_creation_pending_price',
            carId: carId,
            isRead: false,
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Error al crear la notificación de creación de coche:', error);
        res.status(500).json({ error: 'Error interno al crear la notificación.' });
    }
};

// Eliminar una notificación específica
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({ where: { id, userId } });

        if (!notification) {
            return res.status(404).json({ error: 'Notificación no encontrada o no tienes permiso para eliminarla.' });
        }

        await notification.destroy();
        res.status(200).json({ message: 'Notificación eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar la notificación:', error);
        res.status(500).json({ error: 'Error al eliminar la notificación.' });
    }
};