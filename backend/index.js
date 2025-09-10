// autogest-app/backend/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./models');

const app = express();

// --- INICIO DE LA MODIFICACIÓN ---
// Manejo de errores global y no capturados para asegurar que todo se loguea
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Apagando...');
  console.error(err.name, err.message);
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Apagando...');
  console.error(err.name, err.message);
  console.error(err);
  process.exit(1);
});
// --- FIN DE LA MODIFICACIÓN ---


// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://auto-gest.es',
  'https://www.auto-gest.es'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static('public'));

// --- Rutas de la API ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor de AutoGest funcionando correctamente.');
});

const PORT = process.env.PORT || 3001;

// Sincronizar la base de datos antes de iniciar el servidor
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    // Se inicia el servidor después de la sincronización
    app.listen(PORT, () => {
        console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err);
  });