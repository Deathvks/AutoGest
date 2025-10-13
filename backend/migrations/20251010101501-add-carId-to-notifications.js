'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Añadimos la columna 'carId' a la tabla 'Notifications'
    await queryInterface.addColumn('Notifications', 'carId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Cars', // Nombre de la tabla de referencia
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Si se borra un coche, el carId en la notificación se pondrá a null
    });
  },

  async down (queryInterface, Sequelize) {
    // Lógica para revertir el cambio (eliminar la columna)
    await queryInterface.removeColumn('Notifications', 'carId');
  }
};