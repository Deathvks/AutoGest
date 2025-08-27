// autogest-app/backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const avatarUpload = require('../middleware/avatarUpload');

// POST /api/auth/register -> Registrar un nuevo usuario
router.post('/register', authController.register);

// POST /api/auth/login -> Iniciar sesión
router.post('/login', authController.login);

// GET /api/auth/me -> Obtener el perfil del usuario logueado
router.get('/me', protect, authController.getMe);

// PUT /api/auth/profile -> Actualizar el perfil del usuario (nombre, email y avatar)
router.put('/profile', protect, avatarUpload, authController.updateProfile);

// DELETE /api/auth/avatar -> Eliminar la foto de perfil del usuario
router.delete('/avatar', protect, authController.deleteAvatar);

// PUT /api/auth/update-password -> Cambiar la contraseña del usuario
router.put('/update-password', protect, authController.updatePassword);

// DELETE /api/auth/me -> Eliminar la cuenta del usuario actual
router.delete('/me', protect, authController.deleteAccount);

module.exports = router;