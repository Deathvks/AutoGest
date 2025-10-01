// autogest-app/backend/clear-invitations.js
// --- INICIO DE LA MODIFICACIÓN ---
// Se añade dotenv para cargar las variables de entorno del fichero .env
// Esto es necesario para que el script pueda conectarse a la base de datos.
require('dotenv').config();
// --- FIN DE LA MODIFICACIÓN ---
const { sequelize } = require('./models');

const clearInvitationsTable = async () => {
    console.log('Iniciando limpieza de la tabla de invitaciones...');
    const queryInterface = sequelize.getQueryInterface();

    try {
        // Elimina la tabla 'Invitations' por completo.
        await queryInterface.dropTable('Invitations');
        console.log('✅ Tabla "Invitations" eliminada con éxito.');
        console.log('🎉 Limpieza completada. La tabla se recreará en el próximo arranque de la aplicación.');

    } catch (error) {
        if (error.original && error.original.code === 'ER_BAD_TABLE_ERROR') {
            console.warn('⚠️ La tabla "Invitations" no existía, no se ha hecho nada.');
        } else {
            console.error('❌ Error durante la limpieza de la tabla de invitaciones:', error);
        }
    } finally {
        await sequelize.close();
    }
};

clearInvitationsTable();