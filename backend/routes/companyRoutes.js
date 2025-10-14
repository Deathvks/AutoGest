// autogest-app/backend/routes/companyRoutes.js
const express = require('express'); // Corregido: 'express' -> require('express')
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, checkSubscription } = require('../middleware/auth');

// Invitar a un usuario a la empresa del usuario autenticado
router.post('/invite', protect, checkSubscription, companyController.inviteUser);

// Expulsar a un usuario de la empresa
router.delete('/users/:userId/expel', protect, checkSubscription, companyController.expelUser);

// Verificar un token de invitación
router.get('/invitations/verify/:token', companyController.verifyInvitation);

// Aceptar una invitación
router.post('/invitations/accept', protect, companyController.acceptInvitation);

module.exports = router;