const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // userId será la clave foránea que conecta con el modelo User
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
}, {
    timestamps: true,
    // Evita que un mismo usuario tenga la misma ubicación duplicada
    indexes: [
        {
            unique: true,
            fields: ['name', 'userId']
        }
    ]
});

module.exports = Location;