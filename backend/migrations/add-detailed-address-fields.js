// backend/migrations/add-detailed-address-fields.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Campos para Empresa
    await queryInterface.addColumn('Users', 'companyStreetAddress', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'companyPostalCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'companyCity', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'companyProvince', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Campos para Particular / Autónomo
    await queryInterface.addColumn('Users', 'personalStreetAddress', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'personalPostalCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'personalCity', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'personalProvince', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir cambios (eliminar columnas)
    await queryInterface.removeColumn('Users', 'companyStreetAddress');
    await queryInterface.removeColumn('Users', 'companyPostalCode');
    await queryInterface.removeColumn('Users', 'companyCity');
    await queryInterface.removeColumn('Users', 'companyProvince');

    await queryInterface.removeColumn('Users', 'personalStreetAddress');
    await queryInterface.removeColumn('Users', 'personalPostalCode');
    await queryInterface.removeColumn('Users', 'personalCity');
    await queryInterface.removeColumn('Users', 'personalProvince');
  }
};