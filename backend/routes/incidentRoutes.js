// autogest-app/backend/routes/incidentRoutes.js
const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
// --- INICIO DE LA MODIFICACIÓN ---
const { protect, checkSubscription } = require('../middleware/auth');
// --- FIN DE LA MODIFICACIÓN ---

// --- INICIO DE LA MODIFICACIÓN ---
router.route('/')
    .get(protect, incidentController.getIncidents)
    .post(protect, checkSubscription, incidentController.createIncident);

router.route('/:id')
    .put(protect, checkSubscription, incidentController.updateIncident)
    .delete(protect, checkSubscription, incidentController.deleteIncident);
// --- FIN DE LA MODIFICACIÓN ---

router.put('/:id/resolve', protect, incidentController.resolveIncident);

module.exports = router;