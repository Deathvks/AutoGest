// autogest-app/backend/models/index.js
'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const db = {};

// Se cargan los modelos de forma explícita para evitar errores de carga dinámica.
const modelsToLoad = [
  require('./User'),
  require('./Car'),
  require('./Expense'),
  require('./Incident'),
  require('./Location'),
  require('./Company'),
  require('./Invitation'),
  require('./Notification') // --- INICIO DE LA MODIFICACIÓN ---
];

modelsToLoad.forEach(model => {
  const initializedModel = model; // Ya está inicializado con sequelize.define
  db[initializedModel.name] = initializedModel;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// --- Definición de Relaciones ---
const { User, Car, Expense, Incident, Location, Company, Invitation, Notification } = db; // --- INICIO DE LA MODIFICACIÓN ---

// Relaciones de Compañía y Usuario
Company.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasOne(Company, { foreignKey: 'ownerId' });

Company.hasMany(User, { as: 'members', foreignKey: 'companyId' });
User.belongsTo(Company, { foreignKey: 'companyId' });

// Relaciones de Compañía con otros modelos
Company.hasMany(Car, { foreignKey: 'companyId' });
Car.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Expense, { foreignKey: 'companyId' });
Expense.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Location, { foreignKey: 'companyId' });
Location.belongsTo(Company, { foreignKey: 'companyId' });

// Relaciones de Invitaciones
Company.hasMany(Invitation, { foreignKey: 'companyId' });
Invitation.belongsTo(Company, { foreignKey: 'companyId' });

User.hasMany(Invitation, { as: 'sentInvitations', foreignKey: 'inviterId' });
Invitation.belongsTo(User, { as: 'inviter', foreignKey: 'inviterId' });

// --- INICIO DE LA MODIFICACIÓN ---
// Relaciones de Notificaciones
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });
// --- FIN DE LA MODIFICACIÓN ---

// Un usuario tiene muchos coches
User.hasMany(Car, { foreignKey: 'userId', onDelete: 'CASCADE' });
Car.belongsTo(User, { foreignKey: 'userId' });

// Un usuario tiene muchos gastos
User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });

// Un usuario tiene muchas ubicaciones
User.hasMany(Location, { foreignKey: 'userId', onDelete: 'CASCADE' });
Location.belongsTo(User, { foreignKey: 'userId' });

// Un coche tiene muchos gastos (relacionados por matrícula)
Car.hasMany(Expense, { foreignKey: 'carLicensePlate', sourceKey: 'licensePlate', onDelete: 'CASCADE' });
Expense.belongsTo(Car, { foreignKey: 'carLicensePlate', targetKey: 'licensePlate' });

// Un coche tiene muchas incidencias (relacionadas por ID)
Car.hasMany(Incident, { foreignKey: 'carId', onDelete: 'CASCADE' });
Incident.belongsTo(Car, { foreignKey: 'carId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;