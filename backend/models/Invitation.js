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
    // Se elimina la definición explícita de los índices para las claves foráneas.
    // Sequelize los creará automáticamente. Solo mantenemos el índice único para 'token'.
    indexes: [
        {
            unique: true,
            fields: ['token']
        }
    ]
    // --- FIN DE LA MODIFICACIÓN ---
});

module.exports = Invitation;