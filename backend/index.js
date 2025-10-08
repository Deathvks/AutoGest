// autogest-app/backend/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const bodyParser = require('body-parser'); // <-- AÑADIDO
const { processRecurringExpenses } = require('./jobs/recurringExpenses');

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

// --- INICIO DE LA MODIFICACIÓN ---
// Se usa bodyParser para las rutas de Express 4
app.post('/api/subscriptions/webhook', bodyParser.raw({ type: 'application/json' }), require('./controllers/subscription/handleWebhook').handleWebhook);
app.use(bodyParser.json());
// --- FIN DE LA MODIFICACIÓN ---


// --- INICIO DE LA MODIFICACIÓN ---
// Servir archivos estáticos de la API (imágenes subidas, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Servir la aplicación de frontend (build de producción)
app.use(express.static(path.join(__dirname, '../frontend/dist')));
// --- FIN DE LA MODIFICACIÓN ---


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


// --- INICIO DE LA MODIFICACIÓN ---
// Catch-all para servir index.html en rutas de frontend y permitir recargar
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});
// --- FIN DE LA MODIFICACIÓN ---


const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Ya no sincronizamos la base de datos, solo verificamos la conexión.
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);

      console.log('[JOBS] Ejecutando tarea de gastos recurrentes al inicio...');
      processRecurringExpenses(); // Ejecuta una vez al arrancar

      const twentyFourHours = 24 * 60 * 60 * 1000;
      setInterval(() => {
        console.log('[JOBS] Ejecutando tarea programada de gastos recurrentes...');
        processRecurringExpenses();
      }, twentyFourHours); // Se ejecuta cada 24 horas
    });

  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

startServer();