// autogest-app/backend/controllers/car/getCar.js
const { Car, Expense } = require('../../models');
// --- INICIO DE LA MODIFICACIÓN ---
// Se importa la función 'deleteFile' que faltaba.
const { deleteFile } = require('../../utils/carUtils');
// --- FIN DE LA MODIFICACIÓN ---

/**
 * Obtiene todos los coches del usuario logueado o de su empresa.
 * También actualiza el estado de los coches reservados cuya reserva ha expirado.
 */
exports.getAllCars = async (req, res) => {
    try {
        const whereClause = {};
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }

        let cars = await Car.findAll({
            where: whereClause,
            include: [Expense],
            order: [['createdAt', 'DESC']]
        });

        const now = new Date();
        const promises = cars.map(car => {
            if (car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) < now) {
                if (car.reservationPdfUrl) {
                    deleteFile(car.reservationPdfUrl);
                    car.reservationPdfUrl = null;
                }
                car.status = 'En venta';
                car.reservationDeposit = null;
                car.reservationExpiry = null;
                return car.save();
            }
            return Promise.resolve();
        });

        await Promise.all(promises);

        // Mapeo inicial a JSON y asignación de gastos para el frontend
        let carsJson = cars.map(car => {
            const item = car.toJSON();
            if (item.Expenses) {
                item.expenses = item.Expenses;
            }
            return item;
        });

        // --- INICIO DE LA MODIFICACIÓN ---
        // Se oculta el precio de compra para roles no autorizados.
        const allowedRoles = ['admin', 'technician', 'technician_subscribed'];
        if (!allowedRoles.includes(req.user.role)) {
            carsJson = carsJson.map(carJson => {
                delete carJson.purchasePrice;
                return carJson;
            });
        }
        // --- FIN DE LA MODIFICACIÓN ---

        res.status(200).json(carsJson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los coches' });
    }
};

/**
 * Obtiene un coche específico por su ID.
 */
exports.getCarById = async (req, res) => {
    try {
        const whereClause = { id: req.params.id };
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }

        const car = await Car.findOne({
            where: whereClause,
            include: [Expense]
        });

        if (car) {
            const carJson = car.toJSON();
            if (carJson.Expenses) {
                carJson.expenses = carJson.Expenses;
            }

            // --- INICIO DE LA MODIFICACIÓN ---
            // Se oculta el precio de compra para roles no autorizados.
            const allowedRoles = ['admin', 'technician', 'technician_subscribed'];
            if (!allowedRoles.includes(req.user.role)) {
                delete carJson.purchasePrice;
            }
            // --- FIN DE LA MODIFICACIÓN ---

            res.status(200).json(carJson);
        } else {
            res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para verlo' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el coche' });
    }
};