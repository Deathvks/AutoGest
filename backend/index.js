// autogest-app/backend/index.js

const express = require('express');
const cors = require('cors');

// --- INICIO DE LA MODIFICACIÓN ---
// Log de diagnóstico para verificar las variables de entorno al arrancar
console.log('--- INICIANDO APLICACIÓN ---');
console.log(`[ENV] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[ENV] EMAIL_HOST: ${process.env.EMAIL_HOST}`);
console.log(`[ENV] EMAIL_PORT: ${process.env.EMAIL_PORT}`);
console.log('---------------------------');
// --- FIN DE LA MODIFICACIÓN ---

// Solo cargar dotenv si NO estamos en producción.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const db = require('./models');
const subscriptionController = require('./controllers/subscriptionController');

const app = express();

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

app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

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
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor de AutoGest funcionando correctamente.');
});

const PORT = process.env.PORT || 3001;

db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    app.listen(PORT, () => {
        console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err);
  });