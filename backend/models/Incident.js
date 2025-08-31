const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Incident = sequelize.define('Incident', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    licensePlate: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('abierta', 'resuelta'),
        allowNull: false,
        defaultValue: 'abierta',
    },
    carId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Cars',
            key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE', // <-- AÑADIR ESTA LÍNEA
    },
}, {
    timestamps: true,
});

module.exports = Incident;