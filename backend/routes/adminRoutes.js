// autogest-app/backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// --- INICIO DE LA MODIFICACIÓN ---
// Se vuelve a añadir el rol 'technician' a la lista de roles autorizados.
// Ahora, admin, technician y technician_subscribed pueden acceder a estas rutas.
router.use(protect, authorize('admin', 'technician', 'technician_subscribed'));
// --- FIN DE LA MODIFICACIÓN ---

// GET /api/admin/users -> Obtener todos los usuarios
router.get('/users', adminController.getAllUsers);

// POST /api/admin/users -> Crear un nuevo usuario
router.post('/users', adminController.createUser);

// PUT /api/admin/users/:id -> Actualizar un usuario
router.put('/users/:id', adminController.updateUser);

// DELETE /api/admin/users/:id -> Eliminar un usuario
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;