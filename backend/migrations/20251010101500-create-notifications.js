'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // --- INICIO DE LA MODIFICACIÓN ---
      type: {
        type: Sequelize.ENUM('subscription', 'car_created', 'group_created', 'general', 'car_creation_pending_price'),
        allowNull: false,
        defaultValue: 'general'
      },
      // --- FIN DE LA MODIFICACIÓN ---
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // --- INICIO DE LA MODIFICACIÓN ---
      carId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cars',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      // --- FIN DE LA MODIFICACIÓN ---
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  }
};