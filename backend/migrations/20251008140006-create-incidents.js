'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Incidents', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            date: { type: Sequelize.DATEONLY, allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: false },
            licensePlate: { type: Sequelize.STRING, allowNull: false },
            status: { type: Sequelize.ENUM('abierta', 'resuelta'), allowNull: false, defaultValue: 'abierta' },
            carId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Cars', key: 'id' }, onDelete: 'CASCADE' },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Incidents');
    }
};