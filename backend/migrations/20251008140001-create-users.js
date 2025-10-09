'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            name: { type: Sequelize.STRING, allowNull: false },
            email: { type: Sequelize.STRING, allowNull: false, unique: true },
            password: { type: Sequelize.STRING, allowNull: false },
            role: { type: Sequelize.ENUM('user', 'admin', 'technician', 'technician_subscribed'), allowNull: false, defaultValue: 'user' },
            previousRole: { type: Sequelize.ENUM('user', 'admin', 'technician', 'technician_subscribed'), allowNull: true },
            avatarUrl: { type: Sequelize.STRING, allowNull: true },
            logoUrl: { type: Sequelize.STRING, allowNull: true },
            businessName: { type: Sequelize.STRING, allowNull: true },
            dni: { type: Sequelize.STRING, allowNull: true },
            cif: { type: Sequelize.STRING, allowNull: true },
            address: { type: Sequelize.STRING, allowNull: true },
            phone: { type: Sequelize.STRING, allowNull: true },
            subscriptionStatus: { type: Sequelize.ENUM('inactive', 'active', 'cancelled', 'past_due'), allowNull: false, defaultValue: 'inactive' },
            subscriptionExpiry: { type: Sequelize.DATE, allowNull: true },
            stripeCustomerId: { type: Sequelize.STRING, allowNull: true, unique: true },
            invoiceCounter: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            proformaCounter: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            verificationCode: { type: Sequelize.STRING, allowNull: true },
            isVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
            resetPasswordToken: { type: Sequelize.STRING, allowNull: true },
            resetPasswordExpires: { type: Sequelize.DATE, allowNull: true },
            canManageRoles: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
            canExpelUsers: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Users');
    }
};