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
    // --- CAMBIO CLAVE: La clave foránea ahora es la matrícula ---
    carLicensePlate: {
        type: DataTypes.STRING,
        allowNull: false, // Un gasto siempre debe estar asociado a un coche
        references: {
            model: 'Cars', // Nombre de la tabla
            key: 'licensePlate', // Columna a la que se hace referencia
        },
    },
}, {
    timestamps: true,
});

module.exports = Expense;