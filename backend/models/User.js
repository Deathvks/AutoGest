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
        type: DataTypes.ENUM('user', 'admin', 'technician', 'technician_subscribed'),
        allowNull: false,
        defaultValue: 'user',
    },
    previousRole: {
        type: DataTypes.ENUM('user', 'admin', 'technician', 'technician_subscribed'),
        allowNull: true,
        defaultValue: null,
        comment: 'Almacena el rol del usuario antes de unirse a una compañía.'
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
    // --- INICIO DE LA MODIFICACIÓN ---
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
    // --- FIN DE LA MODIFICACIÓN ---
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    canManageRoles: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    canExpelUsers: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Permite a un técnico expulsar a otros miembros del equipo.'
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Companies',
            key: 'id',
        },
        onDelete: 'SET NULL',
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