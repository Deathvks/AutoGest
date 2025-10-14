// autogest-app/backend/routes/incidentRoutes.js
const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { protect, checkSubscription } = require('../middleware/auth');

router.route('/')
    .get(protect, incidentController.getAllIncidents) // Corregido: getIncidents -> getAllIncidents
    .post(protect, checkSubscription, incidentController.createIncident);

router.route('/:id')
    .put(protect, checkSubscription, incidentController.updateIncident)
    .delete(protect, checkSubscription, incidentController.deleteIncident);

// Se elimina la ruta duplicada que ya no es necesaria
// router.put('/:id/resolve', protect, incidentController.resolveIncident);

module.exports = router;