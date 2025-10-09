// autogest-app/backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const locationRoutes = require('./routes/locationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const companyRoutes = require('./routes/companyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { scheduleRecurringExpenses } = require('./jobs/recurringExpenses');

const app = express();

const corsOptions = {
    origin: ['http://localhost:5173', 'http://auto-gest.es', 'https://auto-gest.es'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/avatars', express.static(path.join(__dirname, 'avatars')));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 3001;
let server;

const startServer = () => {
    server = app.listen(PORT, () => {
        console.log(`✅ Servidor iniciado en el puerto ${PORT}`);
        if (process.send) {
            process.send('ready');
        }
    });
};

// --- INICIO DE LA MODIFICACIÓN ---
// Conectamos a la base de datos y luego iniciamos el servidor.
// Se elimina db.sequelize.sync() para evitar modificaciones automáticas en producción.
// La estructura de la base de datos se debe gestionar únicamente con migraciones.
db.sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        startServer();
        scheduleRecurringExpenses();
    })
    .catch(err => {
        console.error('❌ No se pudo conectar a la base de datos:', err);
        process.exit(1);
    });
// --- FIN DE LA MODIFICACIÓN ---


const gracefulShutdown = () => {
    console.log('Received shutdown message, shutting down gracefully.');
    if (server) {
        server.close(() => {
            console.log('Closed out remaining connections.');
            db.sequelize.close().then(() => {
                console.log('Database connection closed.');
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 8000);
};

process.on('message', (msg) => {
  if (msg === 'shutdown') {
    gracefulShutdown();
  }
});

module.exports = app;