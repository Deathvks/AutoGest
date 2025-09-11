// autogest-app/backend/config/database.js
const { Sequelize } = require('sequelize');

// NO debe haber un require('dotenv').config() en este fichero.
// La configuración se gestiona desde el punto de entrada principal (index.js).

// Creamos la instancia de Sequelize con los datos que ya existen en el entorno
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false,
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a la base de datos establecida correctamente.');
    })
    .catch(err => {
        console.error('❌ Error al conectar con la base de datos:', err);
    });

module.exports = sequelize;