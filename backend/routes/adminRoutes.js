// autogest-app/backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

const authorizeForManagement = (req, res, next) => {
    const allowedRoles = ['admin', 'technician', 'technician_subscribed'];
    
    if (allowedRoles.includes(req.user.role) || req.user.canExpelUsers) {
        return next();
    }
    
    return res.status(403).json({ 
        error: `No tienes permiso para acceder a la gestión de usuarios.` 
    });
};

router.use(protect, authorizeForManagement);

// GET /api/admin/users -> Obtener todos los usuarios
router.get('/users', adminController.getAllUsers);

// POST /api/admin/users -> Crear un nuevo usuario
router.post('/users', adminController.createUser);

// PUT /api/admin/users/bulk-role -> Actualizar rol masivamente
router.put('/users/bulk-role', adminController.bulkUpdateRoles);

// PUT /api/admin/users/:id -> Actualizar un usuario
router.put('/users/:id', adminController.updateUser);

// DELETE /api/admin/users/:id -> Eliminar un usuario
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;