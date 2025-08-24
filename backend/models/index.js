'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const sequelize = require('../config/database');
const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// --- Definición de Relaciones ---
const { User, Car, Expense, Incident, Location } = db; // <-- Añade Location

// Un usuario tiene muchos coches
User.hasMany(Car, { foreignKey: 'userId' });
Car.belongsTo(User, { foreignKey: 'userId' });

// --- AÑADE ESTA NUEVA RELACIÓN ---
// Un usuario tiene muchas ubicaciones
User.hasMany(Location, { foreignKey: 'userId' });
Location.belongsTo(User, { foreignKey: 'userId' });

// Un coche tiene muchos gastos (relacionados por matrícula)
Car.hasMany(Expense, { foreignKey: 'carLicensePlate', sourceKey: 'licensePlate' });
Expense.belongsTo(Car, { foreignKey: 'carLicensePlate', targetKey: 'licensePlate' });

// Un coche tiene muchas incidencias (relacionadas por ID)
Car.hasMany(Incident, { foreignKey: 'carId' });
Incident.belongsTo(Car, { foreignKey: 'carId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;