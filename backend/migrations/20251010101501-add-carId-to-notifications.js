'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // La columna 'carId' ya se define y crea en la migración 20251010101500-create-notifications.js.
    // Omitimos esta migración para evitar el error "Duplicate column name 'carId'".
    console.log('Omitiendo migración 20251010101501-add-carId-to-notifications.js porque la columna carId ya existe.');
    return Promise.resolve();
  },

  async down(queryInterface, Sequelize) {
    // No hacemos nada en el down ya que el up no realizó cambios.
    return Promise.resolve();
  }
};