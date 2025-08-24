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
        // unique: true, // Lo quitamos de aquí
    },
    vin: {
        type: DataTypes.STRING,
        // unique: true, // Lo quitamos de aquí
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
    registrationDocumentUrl: {
        type: DataTypes.STRING,
    },
    tags: {
        type: DataTypes.JSON,
    },
}, {
    timestamps: true,
    // Añadimos este bloque para definir los índices explícitamente
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