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
        allowNull: true,
        // --- INICIO DE LA MODIFICACIÓN ---
        // Se elimina la referencia estricta (FK) a nivel de modelo.
        // La relación lógica se mantiene, pero la integridad referencial estricta
        // se ha eliminado de la BD para permitir matrículas duplicadas entre usuarios.
        // references: { model: 'Cars', key: 'licensePlate' },
        // onDelete: 'CASCADE',
        // --- FIN DE LA MODIFICACIÓN ---
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
}, {
    timestamps: true,
});

module.exports = Expense;