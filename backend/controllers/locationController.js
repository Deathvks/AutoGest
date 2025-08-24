const { Location } = require('../models');

// Obtener todas las ubicaciones del usuario logueado
exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.findAll({
            where: { userId: req.user.id },
            order: [['name', 'ASC']] // Ordena alfabéticamente
        });
        res.status(200).json(locations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las ubicaciones.' });
    }
};