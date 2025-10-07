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
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Companies',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    // --- INICIO DE LA MODIFICACIÓN ---
    isRecurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    recurrenceType: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom'),
        allowNull: true,
    },
    recurrenceCustomValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Para "custom", representa el intervalo en días.'
    },
    recurrenceEndDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    nextRecurrenceDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    // --- FIN DE LA MODIFICACIÓN ---
}, {
    timestamps: true,
});

module.exports = Expense;