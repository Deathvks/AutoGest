// autogest-app/backend/models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('subscription', 'car_created', 'group_created', 'general'),
        allowNull: false,
        defaultValue: 'general',
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL a la que navegar al hacer clic, ej: /cars?open=123',
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
});

module.exports = Notification;