// autogest-app/backend/clear.js
require('dotenv').config();
const db = require('./models');

const clearDatabase = async () => {
    console.log('Iniciando limpieza de la base de datos...');
    const queryInterface = db.sequelize.getQueryInterface();
    const tableNames = [
        'Invitations',
        'Locations',
        'Incidents',
        'Expenses',
        'Cars',
        'Users',
        'Companies'
    ];

    try {
        // Desactiva temporalmente las restricciones de clave foránea para permitir el borrado
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
        console.log('Restricciones de clave foránea desactivadas.');

        // Elimina las tablas una por una
        for (const tableName of tableNames) {
            try {
                await queryInterface.dropTable(tableName);
                console.log(` -> Tabla "${tableName}" eliminada.`);
            } catch (error) {
                // Si la tabla no existe, simplemente lo ignoramos y continuamos
                if (error.original && (error.original.code === 'ER_BAD_TABLE_ERROR' || error.original.code === 'ER_UNKNOWN_TABLE')) {
                    console.log(` -> La tabla "${tableName}" no existía, se omite.`);
                } else {
                    throw error; // Lanza cualquier otro error
                }
            }
        }

        // Vuelve a activar las restricciones
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
        console.log('Restricciones de clave foránea reactivadas.');

        // Sincroniza los modelos para volver a crear todas las tablas con la estructura correcta
        await db.sequelize.sync();
        console.log('✅ Base de datos vaciada y reiniciada con éxito.');

    } catch (error) {
        console.error('❌ Error al vaciar la base de datos:', error);
        // Asegúrate de reactivar las claves foráneas incluso si hay un error
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    } finally {
        // Cierra la conexión para que el script finalice
        await db.sequelize.close();
    }
};

clearDatabase();