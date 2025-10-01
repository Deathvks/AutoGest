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
        allowNull: true, // Se cambia a true para que no sea obligatorio
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
    technicalSheetUrl: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    registrationCertificateUrl: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    otherDocumentsUrls: {
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
    keys: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
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
    gestoriaPickupDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    gestoriaReturnDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    invoiceNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    proformaNumber: {
        type: DataTypes.INTEGER,
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
}, {
    timestamps: true,
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se elimina 'paranoid: true' para desactivar el borrado lógico.
    // Ahora, los borrados serán permanentes.
    indexes: [
        {
            name: 'unique_licensePlate', // Se cambia el nombre del índice
            unique: true,
            fields: ['licensePlate'],
            // Se elimina la condición 'where' para que la matrícula sea siempre única.
        },
        {
            name: 'unique_vin', // Se cambia el nombre del índice
            unique: true,
            fields: ['vin'],
            // Se elimina la condición 'where' para que el VIN sea siempre único.
        }
    ]
    // --- FIN DE LA MODIFICACIÓN ---
});

module.exports = Car;