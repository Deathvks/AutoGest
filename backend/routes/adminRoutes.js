// autogest-app/backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// --- INICIO DE LA MODIFICACIÓN ---
// Middleware de autorización personalizado para esta sección.
const authorizeForManagement = (req, res, next) => {
    const allowedRoles = ['admin', 'technician', 'technician_subscribed'];
    
    // Permite el acceso si el usuario tiene un rol de gestión O si tiene el permiso explícito para expulsar.
    if (allowedRoles.includes(req.user.role) || req.user.canExpelUsers) {
        return next();
    }
    
    return res.status(403).json({ 
        error: `No tienes permiso para acceder a la gestión de usuarios.` 
    });
};

// Se aplica la protección y la nueva autorización a todas las rutas de este fichero.
router.use(protect, authorizeForManagement);
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