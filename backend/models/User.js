// autogest-app/backend/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
    },
    avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    logoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    businessName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dni: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cif: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Dirección genérica (legacy o uso general)
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // --- DATOS FISCALES EMPRESA (Detallados) ---
    companyStreetAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    companyPostalCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    companyCity: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    companyProvince: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    companyPhone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // --- DATOS FISCALES PARTICULAR (Detallados) ---
    personalStreetAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    personalPostalCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    personalCity: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    personalProvince: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    personalPhone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subscriptionStatus: {
        type: DataTypes.ENUM('inactive', 'active', 'cancelled', 'past_due'),
        allowNull: false,
        defaultValue: 'inactive',
    },
    subscriptionExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    invoiceCounter: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    proformaCounter: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    verificationCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    trialStartedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    trialExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    hasUsedTrial: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['stripeCustomerId']
        }
    ]
});

module.exports = User;