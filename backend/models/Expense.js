const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    carLicensePlate: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Cars',
            key: 'licensePlate',
        },
        onDelete: 'CASCADE', // <-- AÑADIR ESTA LÍNEA
    },
}, {
    timestamps: true,
});

module.exports = Expense;