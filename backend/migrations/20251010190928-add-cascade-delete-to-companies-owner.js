'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Primero, eliminamos la restricción de clave foránea existente.
    await queryInterface.removeConstraint('Companies', 'companies_ibfk_1');

    // Luego, añadimos la nueva restricción con la opción ON DELETE CASCADE.
    await queryInterface.addConstraint('Companies', {
      fields: ['ownerId'],
      type: 'foreign key',
      name: 'companies_ibfk_1', // Mantenemos el mismo nombre si es posible
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    // En caso de querer revertir, hacemos lo contrario.
    await queryInterface.removeConstraint('Companies', 'companies_ibfk_1');

    await queryInterface.addConstraint('Companies', {
      fields: ['ownerId'],
      type: 'foreign key',
      name: 'companies_ibfk_1',
      references: {
        table: 'Users',
        field: 'id'
      },
      // Sin onDelete
      onUpdate: 'CASCADE'
    });
  }
};