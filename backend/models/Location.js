// autogest-app/backend/models/Location.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
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
    indexes: [
        {
            unique: true,
            fields: ['name', 'userId']
        }
    ]
});

module.exports = Location;