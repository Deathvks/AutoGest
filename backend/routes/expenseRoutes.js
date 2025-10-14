// autogest-app/backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect, checkSubscription } = require('../middleware/auth');
const expenseUpload = require('../middleware/expenseUpload');

router.route('/')
    .get(protect, expenseController.getAllExpenses) // Corregido: getExpenses -> getAllExpenses
    .post(protect, checkSubscription, expenseUpload, expenseController.createExpense);

router.route('/:id')
    .put(protect, checkSubscription, expenseUpload, expenseController.updateExpense)
    .delete(protect, checkSubscription, expenseController.deleteExpense);

router.get('/all', protect, expenseController.getAllUserExpenses);
router.get('/car/:licensePlate', protect, expenseController.getExpensesByCarLicensePlate);

module.exports = router;