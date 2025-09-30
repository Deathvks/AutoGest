// autogest-app/backend/controllers/locationController.js
const { Location } = require('../models');

// Obtener todas las ubicaciones del usuario logueado o de su empresa
exports.getLocations = async (req, res) => {
    try {
        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = {};
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }

        const locations = await Location.findAll({
            where: whereClause,
            order: [['name', 'ASC']] // Ordena alfabéticamente
        });
        // --- FIN DE LA MODIFICACIÓN ---
        res.status(200).json(locations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las ubicaciones.' });
    }
};