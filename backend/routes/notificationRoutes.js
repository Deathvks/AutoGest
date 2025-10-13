// autogest-app/backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Todas las rutas aquí están protegidas y requieren autenticación
router.use(protect);

// GET /api/notifications -> Obtener todas las notificaciones del usuario
router.get('/', notificationController.getNotifications);

// POST /api/notifications/read-all -> Marcar todas como leídas
router.post('/read-all', notificationController.markAllAsRead);

// POST /api/notifications/car-creation -> Crear una notificación para el líder del equipo
router.post('/car-creation', notificationController.createCarCreationNotification);

// --- INICIO DE LA MODIFICACIÓN ---
// DELETE /api/notifications/:id -> Eliminar una notificación específica
router.delete('/:id', notificationController.deleteNotification);
// --- FIN DE LA MODIFICACIÓN ---

module.exports = router;