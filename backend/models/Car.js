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
        // --- INICIO DE LA MODIFICACIÓN ---
        type: DataTypes.ENUM('En venta', 'Vendido', 'Reservado', 'Taller'),
        // --- FIN DE LA MODIFICACIÓN ---
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
    indexes: [
        {
            name: 'unique_licensePlate_user', // Cambiamos el nombre para reflejar el ámbito
            unique: true,
            // Hacemos que la unicidad sea la combinación de matrícula Y usuario
            fields: ['licensePlate', 'userId'],
        },
        {
            name: 'unique_vin',
            unique: true,
            fields: ['vin'],
        }
    ]
    // --- FIN DE LA MODIFICACIÓN ---
});

module.exports = Car;