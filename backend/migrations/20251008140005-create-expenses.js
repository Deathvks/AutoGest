'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Expenses', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            date: { type: Sequelize.DATEONLY, allowNull: false },
            category: { type: Sequelize.STRING, allowNull: false },
            amount: { type: Sequelize.FLOAT, allowNull: false },
            description: { type: Sequelize.TEXT },
            carLicensePlate: { type: Sequelize.STRING, allowNull: true, references: { model: 'Cars', key: 'licensePlate' }, onDelete: 'SET NULL' },
            userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
            attachments: { type: Sequelize.JSON, allowNull: true },
            companyId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Companies', key: 'id' }, onDelete: 'CASCADE' },
            isRecurring: { type: Sequelize.BOOLEAN, defaultValue: false },
            recurrenceType: { type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'custom'), allowNull: true },
            recurrenceCustomValue: { type: Sequelize.INTEGER, allowNull: true },
            recurrenceEndDate: { type: Sequelize.DATEONLY, allowNull: true },
            nextRecurrenceDate: { type: Sequelize.DATEONLY, allowNull: true },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Expenses');
    }
};