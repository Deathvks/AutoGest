// autogest-app/backend/routes/carRoutes.js
const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect, checkSubscription } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/fileUploads'); // Corregido: usar fileUploads
// --- INICIO DE LA MODIFICACIÓN ---
const convertImagesToWebp = require('../middleware/imageConversion');
// --- FIN DE LA MODIFICACIÓN ---

router.route('/')
    .get(protect, carController.getAllCars) // Corregido: getCars -> getAllCars
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se añade el middleware de conversión de imágenes después de la subida y antes del controlador
    .post(protect, checkSubscription, uploadMiddleware, convertImagesToWebp, carController.createCar);
    // --- FIN DE LA MODIFICACIÓN ---

router.route('/:id')
    .get(protect, carController.getCarById) // Añadido para obtener un solo coche
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se añade el middleware de conversión de imágenes después de la subida y antes del controlador
    .put(protect, checkSubscription, uploadMiddleware, convertImagesToWebp, carController.updateCar)
    // --- FIN DE LA MODIFICACIÓN ---
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