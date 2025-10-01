// autogest-app/backend/index.js
// --- INICIO DE LA MODIFICACIÓN ---
// Se elimina por completo la línea require('dotenv').config().
// La carga de variables de entorno ahora es gestionada exclusivamente
// por el script 'dev' en package.json (para desarrollo) o por PM2 (para producción).
// --- FIN DE LA MODIFICACIÓN ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

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

// Se asegura de que la base de datos esté sincronizada ANTES de iniciar el servidor.
// En producción, usa sync() para evitar cambios destructivos.
// En desarrollo, usa sync({ alter: true }) para facilitar el desarrollo.
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
    });

  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    process.exit(1); // Detiene la aplicación si la BBDD no puede sincronizarse
  }
}

syncDatabaseAndStartServer();