// autogest-app/backend/models/Company.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre o razón social de la empresa/equipo.'
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        // --- INICIO DE LA MODIFICACIÓN ---
        onDelete: 'CASCADE', // Si se borra el usuario propietario, se borra la empresa.
        // --- FIN DE LA MODIFICACIÓN ---
        comment: 'ID del usuario que es propietario de la empresa/equipo.'
    },
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['name', 'ownerId']
        }
    ]
});

module.exports = Company;