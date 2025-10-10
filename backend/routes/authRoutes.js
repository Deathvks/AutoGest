// autogest-app/backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const userAccountController = require('../controllers/userAccountController');
const userProfileController = require('../controllers/userProfileController');
const { protect } = require('../middleware/auth');
const profileUpload = require('../middleware/profileUpload');

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
router.post('/register', userAccountController.register);
router.post('/verify', userAccountController.verifyEmail);
router.post('/resend-verification', userAccountController.resendVerificationCode);
router.post('/force-verification', userAccountController.forceVerification);
router.post('/login', userAccountController.login);
router.post('/forgot-password', userAccountController.forgotPassword);
router.post('/reset-password/:token', userAccountController.resetPassword);

// --- Rutas de Perfil (Protegidas) ---
router.get('/me', protect, userProfileController.getMe);

// --- INICIO DE LA MODIFICACIÓN ---
// Nueva ruta para obtener la invitación pendiente del usuario
router.get('/pending-invitation', protect, userProfileController.getPendingInvitation);
// --- FIN DE LA MODIFICACIÓN ---

router.put('/profile', protect, profileUpload, handleMulterError, userProfileController.updateProfile);
router.delete('/logo', protect, userProfileController.deleteLogo);
router.delete('/avatar', protect, userProfileController.deleteAvatar);
router.put('/update-password', protect, userProfileController.updatePassword);
router.delete('/me', protect, userProfileController.deleteAccount);

module.exports = router;