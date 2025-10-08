// autogest-app/backend/models/Invitation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invitation = sequelize.define('Invitation', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
        comment: 'Email del usuario invitado.'
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Token único para la URL de invitación.'
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    inviterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'expired'),
        defaultValue: 'pending',
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    timestamps: true,
    // --- ESTA ES LA PARTE QUE FALTA EN TU FICHERO ---
    indexes: [
        {
            name: 'invitations_token_unique', // Se le da un nombre al índice
            unique: true,
            fields: ['token']
        }
    ]
    // --- FIN DE LA CORRECCIÓN ---
});

module.exports = Invitation;