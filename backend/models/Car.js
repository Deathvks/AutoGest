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
}, {
    timestamps: true,
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se restaura la opción `paranoid` para el borrado lógico.
    paranoid: true, 
    indexes: [
        {
            unique: true,
            fields: ['licensePlate'],
            // Se restaura la condición para que la unicidad solo aplique a coches no eliminados.
            where: {
                deletedAt: null
            }
        },
        {
            unique: true,
            fields: ['vin'],
            where: {
                deletedAt: null
            }
        }
    ]
    // --- FIN DE LA MODIFICACIÓN ---
});

module.exports = Car;