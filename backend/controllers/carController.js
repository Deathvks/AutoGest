// autogest-app/backend/controllers/carController.js

// 1. Se importa el módulo con la lógica principal
const carHandlers = require('./carHandlers');

// 2. Se exportan directamente las funciones importadas para mantener
//    la compatibilidad con las rutas existentes.
exports.getAllCars = carHandlers.getAllCars;
exports.getCarById = carHandlers.getCarById;
exports.createCar = carHandlers.createCar;
exports.updateCar = carHandlers.updateCar;
exports.deleteCar = carHandlers.deleteCar;