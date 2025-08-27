// autogest-app/backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Todas las rutas en este fichero están protegidas y requieren rol de 'admin'
router.use(protect, authorize('admin'));

// GET /api/admin/users -> Obtener todos los usuarios
router.get('/users', adminController.getAllUsers);

// POST /api/admin/users -> Crear un nuevo usuario
router.post('/users', adminController.createUser);

// PUT /api/admin/users/:id -> Actualizar un usuario
router.put('/users/:id', adminController.updateUser);

// DELETE /api/admin/users/:id -> Eliminar un usuario
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;