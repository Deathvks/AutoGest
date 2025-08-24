const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect, authorize } = require('../middleware/auth');
const fileUploads = require('../middleware/fileUploads');

// --- Rutas de Coches Protegidas ---

router.get('/', protect, carController.getAllCars);
router.get('/:id', protect, carController.getCarById);
router.post('/', protect, fileUploads, carController.createCar);
router.put('/:id', protect, fileUploads, carController.updateCar); 

// --- LÍNEA MODIFICADA ---
// Quitamos authorize('admin') para que cualquier usuario pueda borrar sus propios coches
router.delete('/:id', protect, carController.deleteCar);

module.exports = router;