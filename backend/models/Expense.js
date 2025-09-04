// autogest-app/backend/models/Expense.js
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
        allowNull: true, // <-- Esta línea permite que el campo sea nulo
        references: {
            model: 'Cars',
            key: 'licensePlate',
        },
        onDelete: 'CASCADE',
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = Expense;