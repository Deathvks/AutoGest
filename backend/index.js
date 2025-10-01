// autogest-app/backend/index.js
// La carga de variables de entorno es gestionada por el script 'dev' o por PM2.
const express = require('express');
const cors = 'cors';
const path = require('path');
const db = require('./models');

// --- INICIO DE LA MODIFICACIÓN: CAPTURA DE ERRORES Y SALIDAS ---
console.log('[DEBUG] Registrando listeners de proceso...');
process.on('exit', (code) => {
  console.log(`[EXIT] El proceso está a punto de terminar con código: ${code}`);
});

process.on('uncaughtException', (err, origin) => {
  console.error('[UNCAUGHT_EXCEPTION] Error no capturado:', err);
  console.error('[UNCAUGHT_EXCEPTION] Origen:', origin);
  process.exit(1); // Es crucial salir después de una excepción no capturada
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION] Rechazo de promesa no manejado en:', promise);
  console.error('[UNHANDLED_REJECTION] Razón:', reason);
});
console.log('[DEBUG] Listeners de proceso registrados.');
// --- FIN DE LA MODIFICACIÓN ---

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const carRoutes = require('./routes/carRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const locationRoutes = require('./routes/locationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const companyRoutes = require('./routes/companyRoutes');

console.log('[DEBUG] Módulos de rutas cargados.');

const app = express();

const corsOptions = {
    origin: ['http://localhost:5173', 'https://www.auto-gest.es'],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(require('cors')(corsOptions));
console.log('[DEBUG] CORS configurado.');

app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), require('./controllers/subscription/handleWebhook').handleWebhook);
app.use(express.json());
console.log('[DEBUG] Middlewares de Express configurados.');

// Servir todos los archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('AutoGest API is running...');
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/company', companyRoutes);
console.log('[DEBUG] Rutas de la API registradas.');

const PORT = process.env.PORT || 3001;

const syncDatabaseAndStartServer = async () => {
  try {
    console.log('[DEBUG] Iniciando sincronización de la base de datos...');
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Base de datos sincronizada en modo desarrollo (alter).');
    } else {
      await db.sequelize.sync();
      console.log('✅ Base de datos sincronizada en producción (sin alter).');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    process.exit(1);
  }
}

syncDatabaseAndStartServer();