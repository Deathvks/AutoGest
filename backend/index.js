// autogest-app/backend/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./models');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- Rutas de la API ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/locations', require('./routes/locationRoutes')); // <-- AÑADE ESTA LÍNEA

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor de AutoGest funcionando correctamente.');
});

const PORT = process.env.PORT || 3001;

// La sincronización automática se ha comentado para evitar problemas de índices duplicados.
// Se recomienda usar migraciones para gestionar cambios en la base de datos en el futuro.
/*
db.sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    });
}).catch(error => {
    console.error('❌ Error al sincronizar con la base de datos:', error);
});
*/

// Se inicia el servidor directamente
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});