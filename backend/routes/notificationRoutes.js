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

// --- INICIO DE LA MODIFICACIÓN ---
// POST /api/notifications/car-creation -> Crear una notificación para el líder del equipo
router.post('/car-creation', notificationController.createCarCreationNotification);
// --- FIN DE LA MODIFICACIÓN ---

module.exports = router;