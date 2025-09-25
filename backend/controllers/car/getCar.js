// autogest-app/backend/controllers/car/getCar.js
const { Car } = require('../../models');

/**
 * Obtiene todos los coches del usuario logueado.
 * También actualiza el estado de los coches reservados cuya reserva ha expirado.
 */
exports.getAllCars = async (req, res) => {
    try {
        let cars = await Car.findAll({
            where: { userId: req.user.id },
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

        // Si el usuario no es admin/técnico, se oculta el precio de compra.
        if (req.user.role === 'user') {
            cars = cars.map(car => {
                const carJson = car.toJSON();
                delete carJson.purchasePrice;
                return carJson;
            });
        }

        res.status(200).json(cars);
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
        const car = await Car.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (car) {
            const carJson = car.toJSON();
             // Si el usuario no es admin/técnico, se oculta el precio de compra.
            if (req.user.role === 'user') {
                delete carJson.purchasePrice;
            }
            res.status(200).json(carJson);
        } else {
            res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para verlo' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el coche' });
    }
};