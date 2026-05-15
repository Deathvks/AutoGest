// autogest-app/backend/models/index.js
'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const db = {};

const modelsToLoad = [
  require('./User'),
  require('./Car'),
  require('./Expense'),
  require('./Incident'),
  require('./Location'),
  require('./Notification')
];

modelsToLoad.forEach(model => {
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const { User, Car, Expense, Incident, Location, Notification } = db;

// Relaciones de Notificaciones
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Car.hasMany(Notification, { foreignKey: 'carId', onDelete: 'SET NULL' });
Notification.belongsTo(Car, { foreignKey: 'carId' });

// Relaciones de Usuario
User.hasMany(Car, { foreignKey: 'userId', onDelete: 'CASCADE' });
Car.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Location, { foreignKey: 'userId', onDelete: 'CASCADE' });
Location.belongsTo(User, { foreignKey: 'userId' });

// Relaciones de Coche
Car.hasMany(Expense, { foreignKey: 'carLicensePlate', sourceKey: 'licensePlate', onDelete: 'CASCADE' });
Expense.belongsTo(Car, { foreignKey: 'carLicensePlate', targetKey: 'licensePlate' });

Car.hasMany(Incident, { foreignKey: 'carId', onDelete: 'CASCADE' });
Incident.belongsTo(Car, { foreignKey: 'carId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;