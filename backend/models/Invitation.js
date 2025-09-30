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
    // Las columnas se definen como simples enteros. Las relaciones se gestionarán en 'models/index.js'.
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
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se definen explícitamente TODOS los índices para esta tabla en un solo lugar.
    // Esto incluye los índices para las claves foráneas (companyId, inviterId) y el token único.
    indexes: [
        {
            unique: true,
            fields: ['token'],
            name: 'invitations_token_unique_idx' // Índice para asegurar que el token sea único.
        },
        {
            fields: ['companyId'],
            name: 'invitations_company_id_fk_idx' // Índice para la clave foránea de companyId.
        },
        {
            fields: ['inviterId'],
            name: 'invitations_inviter_id_fk_idx' // Índice para la clave foránea de inviterId.
        }
    ]
    // --- FIN DE LA MODIFICACIÓN ---
});

module.exports = Invitation;