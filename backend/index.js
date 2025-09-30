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
// Sincronización de la base de datos y arranque del servidor.
const startServer = async () => {
    try {
        // Sincroniza todos los modelos a la vez. Sequelize gestionará el orden correcto.
        await db.sequelize.sync({ alter: true });
        console.log('✅ Todos los modelos han sido sincronizados correctamente.');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Error al sincronizar la base de datos:', error);
    }
};

startServer();
// --- FIN DE LA MODIFICACIÓN ---