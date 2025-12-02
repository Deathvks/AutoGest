'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Añadimos la columna companyId a la tabla Users
    await queryInterface.addColumn('Users', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Companies', // Nombre de la tabla referenciada
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'companyId');
  }
};