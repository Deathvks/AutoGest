// autogest-app/backend/routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

// --- INICIO DE LA MODIFICACIÓN ---
// Se vuelve a añadir 'technician' a la lista de roles autorizados para invitar.
router.post('/invite', protect, authorize('admin', 'technician', 'technician_subscribed'), companyController.inviteUser);
// --- FIN DE LA MODIFICACIÓN ---

// GET /api/company/invitations/verify/:token -> Verifica si un token de invitación es válido (Ruta Pública)
router.get('/invitations/verify/:token', companyController.verifyInvitation);

// POST /api/company/invitations/accept -> Acepta una invitación (el usuario debe estar logueado)
router.post('/invitations/accept', protect, companyController.acceptInvitation);

// DELETE /api/company/users/:userIdToExpel/expel -> Expulsar a un usuario de la compañía
router.delete('/users/:userIdToExpel/expel', protect, companyController.expelUser);

module.exports = router;