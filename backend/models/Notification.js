// autogest-app/backend/models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // --- INICIO DE LA MODIFICACIÓN ---
    type: {
        type: DataTypes.ENUM('subscription', 'car_created', 'group_created', 'general', 'car_creation_pending_price'),
        allowNull: false,
        defaultValue: 'general',
    },
    // --- FIN DE LA MODIFICACIÓN ---
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL a la que navegar al hacer clic, ej: /cars?open=123',
    },
    carId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Cars',
            key: 'id',
        },
        onDelete: 'SET NULL',
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