// autogest-app/backend/controllers/incidentController.js
const { Incident, Car } = require('../models');

// Obtener todas las incidencias de los coches del usuario o de su empresa
exports.getAllIncidents = async (req, res) => {
    try {
        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = req.user.companyId ? { companyId: req.user.companyId } : { userId: req.user.id };

        const incidents = await Incident.findAll({
            include: [{
                model: Car,
                where: whereClause,
                attributes: []
            }],
            order: [['date', 'DESC']]
        });
        // --- FIN DE LA MODIFICACIÓN ---
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

        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = { id: carId };
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }
        const car = await Car.findOne({ where: whereClause });
        // --- FIN DE LA MODIFICACIÓN ---

        if (!car) {
            return res.status(403).json({ error: 'Permiso denegado. No puedes añadir incidencias a un coche que no es tuyo o de tu equipo.' });
        }

        const newIncident = await Incident.create({ carId, ...incidentData });
        res.status(201).json(newIncident);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la incidencia' });
    }
};

// Actualizar una incidencia (ej. para marcarla como resuelta)
exports.updateIncident = async (req, res) => {
    try {
        const { status } = req.body;
        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = req.user.companyId ? { companyId: req.user.companyId } : { userId: req.user.id };
        const incident = await Incident.findByPk(req.params.id, {
            include: [{
                model: Car,
                where: whereClause // Asegura que el coche asociado pertenezca al usuario o su equipo
            }]
        });
        // --- FIN DE LA MODIFICACIÓN ---

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


// Eliminar una incidencia
exports.deleteIncident = async (req, res) => {
    try {
        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = req.user.companyId ? { companyId: req.user.companyId } : { userId: req.user.id };
        const incident = await Incident.findByPk(req.params.id, {
             include: [{
                model: Car,
                where: whereClause
            }]
        });
        // --- FIN DE LA MODIFICACIÓN ---

        if (!incident) {
             return res.status(404).json({ error: 'Incidencia no encontrada.' });
        }
        
        // --- INICIO DE LA MODIFICACIÓN ---
        // Se elimina la comprobación de rol 'admin' ya que la comprobación de pertenencia al equipo es suficiente
        if (incident.Car.userId !== req.user.id && !req.user.companyId) {
             return res.status(403).json({ error: 'No tienes permiso para eliminar esta incidencia.' });
        }
        // --- FIN DE LA MODIFICACIÓN ---

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
        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = { id: req.params.carId };
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }
        const car = await Car.findOne({ where: whereClause });
        // --- FIN DE LA MODIFICACIÓN ---

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