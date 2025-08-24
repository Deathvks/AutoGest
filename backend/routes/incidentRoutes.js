const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/incidents -> Obtener todas las incidencias
router.get('/', protect, incidentController.getAllIncidents);

// POST /api/incidents -> Crear una nueva incidencia
router.post('/', protect, incidentController.createIncident);

// PUT /api/incidents/:id -> Actualizar una incidencia
router.put('/:id', protect, incidentController.updateIncident);

// --- LÍNEA MODIFICADA ---
// Quitamos authorize('admin') para que los usuarios normales puedan eliminar incidencias
router.delete('/:id', protect, incidentController.deleteIncident);

// GET /api/incidents/car/:carId -> Obtener incidencias de un coche específico
router.get('/car/:carId', protect, incidentController.getIncidentsByCarId);

module.exports = router;