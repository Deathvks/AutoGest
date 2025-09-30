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
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se elimina la restricción 'unique: true' de la definición de la columna.
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Token único para la URL de invitación.'
    },
    // --- FIN DE LA MODIFICACIÓN ---
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Companies',
            key: 'id',
        }
    },
    inviterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        }
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
    // Se define el índice de unicidad de forma explícita en las opciones del modelo.
    // Esto proporciona un mejor control y evita la creación de índices redundantes.
    indexes: [
        {
            unique: true,
            fields: ['token'],
            name: 'invitations_token_unique_idx' // Se le da un nombre explícito
        }
    ]
    // --- FIN DE LA MODIFICACIÓN ---
});

module.exports = Invitation;