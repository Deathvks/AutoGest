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

sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        // sequelize.sync({ alter: true }); // <-- LÍNEA COMENTADA O ELIMINADA
    })
    .catch(err => {
        console.error('❌ Error al conectar con la base de datos:', err);
    });

module.exports = sequelize;