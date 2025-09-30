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
    // --- INICIO DE LA MODIFICACIÓN ---
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Companies',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    // --- FIN DE LA MODIFICACIÓN ---
}, {
    timestamps: true,
    paranoid: true, 
    indexes: [
        {
            name: 'unique_licensePlate_not_deleted',
            unique: true,
            fields: ['licensePlate'],
            where: {
                deletedAt: null
            }
        },
        {
            name: 'unique_vin_not_deleted',
            unique: true,
            fields: ['vin'],
            where: {
                deletedAt: null
            }
        }
    ]
});

module.exports = Car;