// autogest-app/backend/routes/carRoutes.js
const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect, checkSubscription } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/fileUploads'); // Corregido: usar fileUploads

router.route('/')
    .get(protect, carController.getAllCars) // Corregido: getCars -> getAllCars
    .post(protect, checkSubscription, uploadMiddleware, carController.createCar);

router.route('/:id')
    .get(protect, carController.getCarById) // Añadido para obtener un solo coche
    .put(protect, checkSubscription, uploadMiddleware, carController.updateCar)
    .delete(protect, checkSubscription, carController.deleteCar);

// Eliminadas las rutas antiguas que ya no existen en el controlador
// router.post('/:id/sell', protect, carController.sellCar);
// router.post('/:id/reserve', protect, carController.reserveCar);
// router.post('/:id/cancel-reservation', protect, carController.cancelReservation);
// router.post('/:id/update-status', protect, carController.updateCarStatus);
// router.post('/:id/add-note', protect, carController.addNote);
// router.delete('/:carId/notes/:noteId', protect, carController.deleteNote);
// router.post('/:id/generate-pdf', protect, carController.generatePdf);
// router.delete('/:id/files', protect, carController.deleteFile);

module.exports = router;