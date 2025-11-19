// autogest-app/backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect, checkSubscription } = require('../middleware/auth');
const expenseUpload = require('../middleware/expenseUpload');
// --- INICIO DE LA MODIFICACIÓN ---
const convertImagesToWebp = require('../middleware/imageConversion');
// --- FIN DE LA MODIFICACIÓN ---

router.route('/')
    .get(protect, expenseController.getAllExpenses)
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se añade convertImagesToWebp tras la subida de ficheros
    .post(protect, checkSubscription, expenseUpload, convertImagesToWebp, expenseController.createExpense);
    // --- FIN DE LA MODIFICACIÓN ---

router.route('/:id')
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se añade convertImagesToWebp tras la subida de ficheros
    .put(protect, checkSubscription, expenseUpload, convertImagesToWebp, expenseController.updateExpense)
    // --- FIN DE LA MODIFICACIÓN ---
    .delete(protect, checkSubscription, expenseController.deleteExpense);

router.get('/all', protect, expenseController.getAllUserExpenses);
router.get('/car/:licensePlate', protect, expenseController.getExpensesByCarLicensePlate);

module.exports = router;