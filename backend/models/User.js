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
        unique: true,
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
    // --- CAMPO AÑADIDO ---
    avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true, // Permitimos que sea nulo si el usuario no tiene foto
    },
}, {
    timestamps: true,
});

module.exports = User;