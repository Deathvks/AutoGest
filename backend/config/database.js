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
        define: {
            engine: 'InnoDB'
        }
    }
);

// --- INICIO DE LA MODIFICACIÓN ---
// Se elimina la llamada a sequelize.authenticate() de este fichero.
// La verificación de la conexión se centraliza en index.js para evitar logs duplicados
// y asegurar que el servidor solo arranque si la base de datos está disponible.
// --- FIN DE LA MODIFICACIÓN ---

module.exports = sequelize;