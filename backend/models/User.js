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
        type: DataTypes.ENUM('user', 'admin', 'technician'),
        allowNull: false,
        defaultValue: 'user',
    },
    avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // --- INICIO DE LA MODIFICACIÓN ---
    logoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // --- FIN DE LA MODIFICACIÓN ---
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
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
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
    applyIgic: {
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
    },
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