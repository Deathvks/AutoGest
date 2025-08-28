// autogest-app/backend/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./models');

const app = express();

app.use(cors());
app.use(express.json()); // <-- AÑADE ESTA LÍNEA
app.use(express.static('public'));

// --- Rutas de la API ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));

// --- NUEVA RUTA PARA LA ADMINISTRACIÓN ---
app.use('/api/admin', require('./routes/adminRoutes'));

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor de AutoGest funcionando correctamente.');
});

const PORT = process.env.PORT || 3001;

// Se inicia el servidor directamente
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});