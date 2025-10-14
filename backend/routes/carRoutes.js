// autogest-app/backend/routes/carRoutes.js
const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
// --- INICIO DE LA MODIFICACIÓN ---
const { protect, checkSubscription } = require('../middleware/auth');
// --- FIN DE LA MODIFICACIÓN ---
const upload = require('../middleware/upload');

const uploadMiddleware = upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'documentation', maxCount: 5 }
]);

// --- INICIO DE LA MODIFICACIÓN ---
router.route('/')
    .get(protect, carController.getCars)
    .post(protect, checkSubscription, uploadMiddleware, carController.createCar);

router.route('/:id')
    .put(protect, checkSubscription, uploadMiddleware, carController.updateCar)
    .delete(protect, checkSubscription, carController.deleteCar);
// --- FIN DE LA MODIFICACIÓN ---
    
router.post('/:id/sell', protect, carController.sellCar);
router.post('/:id/reserve', protect, carController.reserveCar);
router.post('/:id/cancel-reservation', protect, carController.cancelReservation);
router.post('/:id/update-status', protect, carController.updateCarStatus);
router.post('/:id/add-note', protect, carController.addNote);
router.delete('/:carId/notes/:noteId', protect, carController.deleteNote);
router.post('/:id/generate-pdf', protect, carController.generatePdf);
router.delete('/:id/files', protect, carController.deleteFile);

module.exports = router;