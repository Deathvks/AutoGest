// autogest-app/backend/models/Car.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Car = sequelize.define('Car', {
    make: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    purchasePrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    salePrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    reservationDeposit: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'En venta',
    },
    location: {
        type: DataTypes.STRING,
    },
    km: {
        type: DataTypes.INTEGER,
    },
    fuel: {
        type: DataTypes.STRING,
    },
    horsepower: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    registrationDate: {
        type: DataTypes.DATEONLY,
    },
    licensePlate: {
        type: DataTypes.STRING,
    },
    vin: {
        type: DataTypes.STRING,
    },
    transmission: {
        type: DataTypes.STRING,
    },
    notes: {
        type: DataTypes.TEXT,
    },
    imageUrl: {
        type: DataTypes.STRING,
    },
    documentUrls: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    tags: {
        type: DataTypes.JSON,
    },
    hasInsurance: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    saleDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    buyerDetails: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    reservationExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    reservationPdfUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // --- INICIO DE LA MODIFICACIÓN ---
    gestoriaPickupDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    gestoriaReturnDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    // --- FIN DE LA MODIFICACIÓN ---
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['licensePlate']
        },
        {
            unique: true,
            fields: ['vin']
        }
    ]
});

module.exports = Car;