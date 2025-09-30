// autogest-app/backend/index.js
require('dotenv').config();
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

// Servir archivos estáticos (fotos de coches, avatares, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// --- INICIO DE LA MODIFICACIÓN ---
// Sincronización controlada de la base de datos para resolver dependencias circulares.
const syncDatabase = async () => {
    try {
        // 1. Sincroniza el modelo 'Company' primero, ya que 'User' depende de él.
        await db.Company.sync({ alter: true });
        console.log('✅ Modelo Company sincronizado.');

        // 2. Sincroniza todos los demás modelos.
        // Sequelize es lo suficientemente inteligente para no volver a sincronizar 'Company'.
        await db.sequelize.sync({ alter: true });
        console.log('✅ Todos los modelos han sido sincronizados correctamente.');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Error al sincronizar la base de datos:', error);
    }
};

syncDatabase();
// --- FIN DE LA MODIFICACIÓN ---