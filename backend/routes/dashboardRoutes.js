// autogest-app/backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// Todas las rutas aquí están protegidas
router.use(protect);

// GET /api/dashboard/stats -> Obtener las estadísticas principales (con filtro de fecha)
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/activity -> Obtener el historial de actividad paginado
router.get('/activity', dashboardController.getActivityHistory);

module.exports = router;