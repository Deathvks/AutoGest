// autogest-app/backend/index.js

const express = require('express');
const cors = require('cors');

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

// --- INICIO DE LA MODIFICACIÓN ---
// 1. Ruta de Webhook de Stripe. Se define ANTES de CUALQUIER OTRO middleware
// que pueda parsear el body, incluyendo cors y express.json().
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);
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

// 2. Se aplica el middleware express.json() DESPUÉS de la ruta del webhook.
// De esta forma, solo las rutas definidas a continuación procesarán el body como JSON.
app.use(express.json());
app.use(express.static('public'));

// --- Rutas de la API (ahora usarán express.json()) ---
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