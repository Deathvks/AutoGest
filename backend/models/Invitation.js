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
        comment: 'Token único para la URL de invitación.'
    },
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se eliminan los bloques 'references'. Las columnas se definen como simples enteros.
    // Las relaciones y claves foráneas se gestionarán exclusivamente en el fichero 'models/index.js'.
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    inviterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // --- FIN DE LA MODIFICACIÓN ---
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
    indexes: [
        {
            unique: true,
            fields: ['token'],
            name: 'invitations_token_unique_idx'
        }
    ]
});

module.exports = Invitation;