// autogest-app/backend/index.js
// La carga de variables de entorno es gestionada por el script 'dev' o por PM2.
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
// --- INICIO DE LA MODIFICACIÓN ---
const { processRecurringExpenses } = require('./jobs/recurringExpenses');
// --- FIN DE LA MODIFICACIÓN ---

// Listeners para capturar cualquier salida inesperada del proceso
process.on('exit', (code) => {
  console.log(`[EXIT] El proceso está a punto de terminar con código: ${code}`);
});
process.on('uncaughtException', (err, origin) => {
  console.error('[UNCAUGHT_EXCEPTION] Error no capturado:', err);
  console.error('[UNCAUGHT_EXCEPTION] Origen:', origin);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION] Rechazo de promesa no manejado en:', promise);
  console.error('[UNHANDLED_REJECTION] Razón:', reason);
});

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const carRoutes = require('./routes/carRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const locationRoutes = require('./routes/locationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const companyRoutes = require('./routes/companyRoutes');

const app = express();

const corsOptions = {
    origin: ['http://localhost:5173', 'https://www.auto-gest.es'],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), require('./controllers/subscription/handleWebhook').handleWebhook);
app.use(express.json());

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

const PORT = process.env.PORT || 3001;

const syncDatabaseAndStartServer = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Base de datos sincronizada en modo desarrollo (alter).');
    } else {
      await db.sequelize.sync();
      console.log('✅ Base de datos sincronizada en producción (sin alter).');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);

      // --- INICIO DE LA MODIFICACIÓN ---
      // Ejecutar la tarea de gastos recurrentes al iniciar y luego cada 24 horas
      console.log('[JOBS] Ejecutando tarea de gastos recurrentes al inicio...');
      processRecurringExpenses(); // Ejecuta una vez al arrancar

      const twentyFourHours = 24 * 60 * 60 * 1000;
      setInterval(() => {
        console.log('[JOBS] Ejecutando tarea programada de gastos recurrentes...');
        processRecurringExpenses();
      }, twentyFourHours); // Se ejecuta cada 24 horas
      // --- FIN DE LA MODIFICACIÓN ---
    });

  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    process.exit(1);
  }
}

syncDatabaseAndStartServer();

// Se elimina el intervalo vacío anterior que mantenía el proceso vivo.
// La nueva tarea programada cumplirá una función similar.