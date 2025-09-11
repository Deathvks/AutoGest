// autogest-app/backend/config/database.js
const { Sequelize } = require('sequelize');
// --- INICIO DE LA MODIFICACIÓN ---
// Se elimina la siguiente línea. La configuración de dotenv ya se gestiona en index.js
// require('dotenv').config(); 
// --- FIN DE LA MODIFICACIÓN ---

// Creamos la instancia de Sequelize con los datos de conexión que ya existen en el entorno
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