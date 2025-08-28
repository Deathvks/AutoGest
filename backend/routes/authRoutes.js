// autogest-app/backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const avatarUpload = require('../middleware/avatarUpload');

// Middleware para manejar errores de Multer
const handleMulterError = (err, req, res, next) => {
    if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.' 
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
                error: 'Tipo de archivo no permitido. Solo se aceptan imágenes.' 
            });
        }
        if (err.message) {
            return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: 'Error al procesar el archivo.' });
    }
    next();
};

// POST /api/auth/register -> Registrar un nuevo usuario
router.post('/register', authController.register);

// POST /api/auth/login -> Iniciar sesión
router.post('/login', authController.login);

// GET /api/auth/me -> Obtener el perfil del usuario logueado
router.get('/me', protect, authController.getMe);

// PUT /api/auth/profile -> Actualizar el perfil del usuario (nombre, email y avatar)
router.put('/profile', protect, avatarUpload, handleMulterError, authController.updateProfile);

// DELETE /api/auth/avatar -> Eliminar la foto de perfil del usuario
router.delete('/avatar', protect, authController.deleteAvatar);

// PUT /api/auth/update-password -> Cambiar la contraseña del usuario
router.put('/update-password', protect, authController.updatePassword);

// DELETE /api/auth/me -> Eliminar la cuenta del usuario actual
router.delete('/me', protect, authController.deleteAccount);

module.exports = router;