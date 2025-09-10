// autogest-app/backend/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./models');

const app = express();

// --- INICIO DE LA CORRECCIÓN ---
// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://auto-gest.es',
  'https://www.auto-gest.es'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como las de Postman o apps móviles) y las de la lista blanca
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
};

app.use(cors(corsOptions)); // Usamos la nueva configuración
// --- FIN DE LA CORRECCIÓN ---

app.use(express.json());
app.use(express.static('public'));

// --- Rutas de la API ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// --- NUEVA RUTA PARA EL DASHBOARD ---
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