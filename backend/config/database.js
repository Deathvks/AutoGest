const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carga las variables del archivo .env

// Creamos la instancia de Sequelize con los datos de conexión de .env
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false, // Opcional: ponlo en `true` para ver las consultas SQL en la consola
    }
);

// Función autoejecutable para probar la conexión
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
    }
})();

// Exportamos la instancia para poder usarla en otras partes de la aplicación
module.exports = sequelize;