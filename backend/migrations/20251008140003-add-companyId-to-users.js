// autogest-app/backend/migrations/20251008140003-add-companyId-to-users.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Esta función está intencionadamente vacía.
    // La columna 'companyId' ya existe en la tabla 'Users'.
    // Al ejecutar la migración, Sequelize marcará este fichero como completado
    // sin intentar hacer cambios, resolviendo el conflicto.
    console.log('Omitiendo migración 20251008140003-add-companyId-to-users.js porque el cambio ya existe.');
    return Promise.resolve();
  },

  async down(queryInterface, Sequelize) {
    // Dejamos la función 'down' como estaba por si alguna vez es necesario.
    await queryInterface.removeColumn('Users', 'companyId');
  }
};