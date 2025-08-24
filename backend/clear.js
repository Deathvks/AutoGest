const db = require('./models');

const clearDatabase = async () => {
    console.log('Iniciando limpieza de la base de datos...');
    try {
        // La opción { force: true } elimina todas las tablas y las vuelve a crear vacías.
        await db.sequelize.sync({ force: true });
        console.log('✅ Base de datos vaciada y reiniciada con éxito.');
    } catch (error) {
        console.error('❌ Error al vaciar la base de datos:', error);
    } finally {
        // Cierra la conexión para que el script finalice
        await db.sequelize.close();
    }
};

clearDatabase();