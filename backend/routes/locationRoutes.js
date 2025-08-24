const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect } = require('../middleware/auth');

// GET /api/locations -> Obtener todas las ubicaciones del usuario logueado
router.get('/', protect, locationController.getLocations);

module.exports = router;