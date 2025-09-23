// autogest-app/backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const userAccountController = require('../controllers/userAccountController');
const userProfileController = require('../controllers/userProfileController');
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

// --- Rutas de Cuenta ---
// POST /api/auth/register -> Registrar un nuevo usuario
router.post('/register', userAccountController.register);

// --- INICIO DE LA MODIFICACIÓN ---
// POST /api/auth/verify -> Verificar el email del usuario con el código
router.post('/verify', userAccountController.verifyEmail);

// POST /api/auth/resend-verification -> Reenviar el código de verificación
router.post('/resend-verification', userAccountController.resendVerificationCode);
// --- FIN DE LA MODIFICACIÓN ---

// POST /api/auth/login -> Iniciar sesión
router.post('/login', userAccountController.login);


// --- Rutas de Perfil (Protegidas) ---
// GET /api/auth/me -> Obtener el perfil del usuario logueado
router.get('/me', protect, userProfileController.getMe);

// PUT /api/auth/profile -> Actualizar el perfil del usuario (nombre, email y avatar)
router.put('/profile', protect, avatarUpload, handleMulterError, userProfileController.updateProfile);

// DELETE /api/auth/avatar -> Eliminar la foto de perfil del usuario
router.delete('/avatar', protect, userProfileController.deleteAvatar);

// PUT /api/auth/update-password -> Cambiar la contraseña del usuario
router.put('/update-password', protect, userProfileController.updatePassword);

// DELETE /api/auth/me -> Eliminar la cuenta del usuario actual
router.delete('/me', protect, userProfileController.deleteAccount);

module.exports = router;