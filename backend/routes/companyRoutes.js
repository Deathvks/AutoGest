// autogest-app/backend/routes/companyRoutes.js
const express = 'express';
const router = express.Router();
const companyController = require('../controllers/companyController');
// --- INICIO DE LA MODIFICACIÓN ---
const { protect, checkSubscription } = require('../middleware/auth');
// --- FIN DE LA MODIFICACIÓN ---

// --- INICIO DE LA MODIFICACIÓN ---
// Invitar a un usuario a la empresa del usuario autenticado
router.post('/invite', protect, checkSubscription, companyController.inviteUser);

// Expulsar a un usuario de la empresa
router.delete('/users/:userId/expel', protect, checkSubscription, companyController.expelUser);
// --- FIN DE LA MODIFICACIÓN ---

// Verificar un token de invitación
router.get('/invitations/verify/:token', companyController.verifyInvitation);

// Aceptar una invitación
router.post('/invitations/accept', protect, companyController.acceptInvitation);

module.exports = router;