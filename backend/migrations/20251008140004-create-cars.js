'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Cars', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            make: { type: Sequelize.STRING, allowNull: false },
            model: { type: Sequelize.STRING, allowNull: false },
            price: { type: Sequelize.FLOAT, allowNull: false },
            purchasePrice: { type: Sequelize.FLOAT, allowNull: true },
            salePrice: { type: Sequelize.FLOAT, allowNull: true },
            reservationDeposit: { type: Sequelize.FLOAT, allowNull: true },
            status: { type: Sequelize.ENUM('En venta', 'Vendido', 'Reservado', 'Taller'), allowNull: false, defaultValue: 'En venta' },
            location: { type: Sequelize.STRING },
            km: { type: Sequelize.INTEGER },
            fuel: { type: Sequelize.STRING },
            horsepower: { type: Sequelize.INTEGER, allowNull: true },
            registrationDate: { type: Sequelize.DATEONLY },
            licensePlate: { type: Sequelize.STRING, unique: true },
            vin: { type: Sequelize.STRING, unique: true },
            transmission: { type: Sequelize.STRING },
            notes: { type: Sequelize.TEXT },
            imageUrl: { type: Sequelize.STRING },
            technicalSheetUrl: { type: Sequelize.JSON, allowNull: true },
            registrationCertificateUrl: { type: Sequelize.JSON, allowNull: true },
            otherDocumentsUrls: { type: Sequelize.JSON, allowNull: true },
            tags: { type: Sequelize.JSON },
            hasInsurance: { type: Sequelize.BOOLEAN, defaultValue: false },
            keys: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 1 },
            saleDate: { type: Sequelize.DATEONLY, allowNull: true },
            buyerDetails: { type: Sequelize.JSON, allowNull: true },
            reservationExpiry: { type: Sequelize.DATE, allowNull: true },
            reservationPdfUrl: { type: Sequelize.STRING, allowNull: true },
            gestoriaPickupDate: { type: Sequelize.DATEONLY, allowNull: true },
            gestoriaReturnDate: { type: Sequelize.DATEONLY, allowNull: true },
            invoiceNumber: { type: Sequelize.INTEGER, allowNull: true },
            proformaNumber: { type: Sequelize.INTEGER, allowNull: true },
            userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
            companyId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Companies', key: 'id' }, onDelete: 'CASCADE' },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Cars');
    }
};