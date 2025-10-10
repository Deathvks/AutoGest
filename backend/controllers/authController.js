// autogest-app/backend/controllers/authController.js
const userAccountController = require('./userAccountController');
const userProfileController = require('./userProfileController');

module.exports = {
  // Funciones de userAccountController
  register: userAccountController.register,
  login: userAccountController.login,

  // Funciones de userProfileController
  getMe: userProfileController.getMe,
  // --- INICIO DE LA MODIFICACIÓN ---
  getPendingInvitation: userProfileController.getPendingInvitation, // Se añade la nueva función
  // --- FIN DE LA MODIFICACIÓN ---
  updateProfile: userProfileController.updateProfile,
  deleteAvatar: userProfileController.deleteAvatar,
  updatePassword: userProfileController.updatePassword,
  deleteAccount: userProfileController.deleteAccount,
};