// autogest-app/backend/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// --- Rutas de Suscripción Protegidas ---

// Crear una nueva sesión de checkout para la suscripción
router.post('/create-subscription', protect, subscriptionController.createSubscription);

// Obtener el estado de la suscripción del usuario actual
router.get('/status', protect, subscriptionController.getSubscriptionStatus);

// Cancelar la suscripción del usuario actual
router.post('/cancel-subscription', protect, subscriptionController.cancelSubscription);

// Reactivar una suscripción cancelada
router.post('/reactivate-subscription', protect, subscriptionController.reactivateSubscription);

// --- INICIO DE LA MODIFICACIÓN ---
// Sincronizar el estado de la suscripción manualmente
router.post('/sync', protect, subscriptionController.syncSubscription);
// --- FIN DE LA MODIFICACIÓN ---

module.exports = router;