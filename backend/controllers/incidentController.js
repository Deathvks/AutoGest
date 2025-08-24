const { Incident, Car } = require('../models');

// Obtener todas las incidencias de los coches del usuario
exports.getAllIncidents = async (req, res) => {
    try {
        const incidents = await Incident.findAll({
            include: [{
                model: Car,
                where: { userId: req.user.id },
                attributes: []
            }],
            order: [['date', 'DESC']]
        });
        res.status(200).json(incidents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las incidencias' });
    }
};

// Crear una nueva incidencia
exports.createIncident = async (req, res) => {
    try {
        const { carId, ...incidentData } = req.body;

        const car = await Car.findOne({ where: { id: carId, userId: req.user.id } });
        if (!car) {
            return res.status(403).json({ error: 'Permiso denegado. No puedes añadir incidencias a un coche que no es tuyo.' });
        }

        const newIncident = await Incident.create({ carId, ...incidentData });
        res.status(201).json(newIncident);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la incidencia' });
    }
};

// --- FUNCIÓN NUEVA ---
// Actualizar una incidencia (ej. para marcarla como resuelta)
exports.updateIncident = async (req, res) => {
    try {
        const { status } = req.body;
        const incident = await Incident.findByPk(req.params.id, {
            include: [{
                model: Car,
                where: { userId: req.user.id } // Asegura que el coche asociado pertenezca al usuario
            }]
        });

        if (!incident) {
            return res.status(404).json({ error: 'Incidencia no encontrada o no tienes permiso para editarla.' });
        }

        incident.status = status || incident.status;
        await incident.save();

        res.status(200).json(incident);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la incidencia.' });
    }
};


// Eliminar una incidencia (solo admin)
exports.deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findByPk(req.params.id, {
             include: [{
                model: Car
            }]
        });

        if (!incident) {
             return res.status(404).json({ error: 'Incidencia no encontrada.' });
        }
        
        // Aunque la ruta es de admin, comprobamos por seguridad
        if (incident.Car.userId !== req.user.id && req.user.role !== 'admin') {
             return res.status(403).json({ error: 'No tienes permiso para eliminar esta incidencia.' });
        }

        await incident.destroy();
        res.status(200).json({ message: 'Incidencia eliminada permanentemente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la incidencia.' });
    }
};

// Obtener incidencias por el ID de un coche
exports.getIncidentsByCarId = async (req, res) => {
    try {
        const car = await Car.findOne({ where: { id: req.params.carId, userId: req.user.id } });
        if (!car) {
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para ver sus incidencias.' });
        }
        
        const incidents = await Incident.findAll({
            where: { carId: req.params.carId },
            order: [['date', 'DESC']]
        });
        res.status(200).json(incidents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las incidencias del coche' });
    }
};