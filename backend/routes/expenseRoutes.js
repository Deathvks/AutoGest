// autogest-app/backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
// --- INICIO DE LA MODIFICACIÓN ---
const { protect, checkSubscription } = require('../middleware/auth');
// --- FIN DE LA MODIFICACIÓN ---
const expenseUpload = require('../middleware/expenseUpload');

// --- INICIO DE LA MODIFICACIÓN ---
router.route('/')
    .get(protect, expenseController.getExpenses)
    .post(protect, checkSubscription, expenseUpload, expenseController.createExpense);

router.route('/:id')
    .put(protect, checkSubscription, expenseUpload, expenseController.updateExpense)
    .delete(protect, checkSubscription, expenseController.deleteExpense);
// --- FIN DE LA MODIFICACIÓN ---

router.get('/all', protect, expenseController.getAllUserExpenses);
router.get('/car/:licensePlate', protect, expenseController.getExpensesByCarLicensePlate);

module.exports = router;