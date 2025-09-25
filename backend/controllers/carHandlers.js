// autogest-app/backend/controllers/carHandlers.js
const { getAllCars, getCarById } = require('./car/getCar');
const { createCar } = require('./car/createCar');
const { updateCar } = require('./car/updateCar');
const { deleteCar } = require('./car/deleteCar');

// Se exportan todas las funciones importadas de los módulos específicos.
// Esto permite que el resto de la aplicación siga funcionando sin cambios en las rutas.
module.exports = {
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
};