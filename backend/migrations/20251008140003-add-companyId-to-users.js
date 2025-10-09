'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'companyId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'Companies', key: 'id' },
            onDelete: 'SET NULL'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'companyId');
    }
};