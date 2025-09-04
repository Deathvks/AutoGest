// autogest-app/backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');
const expenseUpload = require('../middleware/expenseUpload');

// GET /api/expenses -> Obtener todos los gastos
router.get('/', protect, expenseController.getAllExpenses);

// POST /api/expenses -> Crear un nuevo gasto con posibles archivos adjuntos
router.post('/', protect, expenseUpload, expenseController.createExpense);

// PUT /api/expenses/:id -> Actualizar un gasto
router.put('/:id', protect, expenseUpload, expenseController.updateExpense);

// DELETE /api/expenses/:id -> Eliminar un gasto por su ID
router.delete('/:id', protect, expenseController.deleteExpense);

// GET /api/expenses/car/:licensePlate -> Obtener gastos de un coche por matrícula
router.get('/car/:licensePlate', protect, expenseController.getExpensesByCarLicensePlate);

module.exports = router;