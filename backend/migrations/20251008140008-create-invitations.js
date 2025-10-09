'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invitations', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      email: { type: Sequelize.STRING, allowNull: false },
      token: { type: Sequelize.STRING, allowNull: false, unique: true },
      companyId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Companies', key: 'id' }, onDelete: 'CASCADE' },
      inviterId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      status: { type: Sequelize.ENUM('pending', 'accepted', 'expired'), defaultValue: 'pending' },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Invitations');
  }
};