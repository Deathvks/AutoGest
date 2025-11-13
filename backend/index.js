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
const notificationRoutes = require('./routes/notificationRoutes');
const { scheduleRecurringExpenses } = require('./jobs/recurringExpenses');
const { scheduleSubscriptionReminders } = require('./jobs/subscriptionReminders');
const subscriptionController = require('./controllers/subscriptionController');

const app = express();

// --- INICIO DE LA MODIFICACIÓN ---
const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5174', 'http://auto-gest.es', 'https://auto-gest.es'],
    optionsSuccessStatus: 200
};
// --- FIN DE LA MODIFICACIÓN ---

app.use(cors(corsOptions));

// La ruta del webhook de Stripe DEBE registrarse ANTES de `express.json()`.
// Usamos `express.raw` para que el cuerpo de la petición se mantenga como un Buffer,
// que es lo que Stripe necesita para verificar la firma.
app.post(
    '/api/subscriptions/webhook',
    express.raw({ type: 'application/json' }),
    subscriptionController.handleWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(express.static(path.join(__dirname, 'public')));

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

    server.on('error', (err) => {
        console.error('❌ ERROR DEL SERVIDOR:', err);
        process.exit(1);
    });
};

db.sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        startServer();
        scheduleRecurringExpenses();
        scheduleSubscriptionReminders();
    })
    .catch(err => {
        console.error('❌ No se pudo conectar a la base de datos:', err);
        process.exit(1);
    });

const gracefulShutdown = async () => {
    // Se cambia el mensaje para reflejar que puede ser por SIGINT o SIGTERM
    console.log('Señal de apagado recibida, iniciando apagado...');

    const shutdownTimer = setTimeout(() => {
        console.error('El apagado se ha demorado más de 8 segundos. Forzando salida.');
        process.exit(1);
    }, 8000); // 8 segundos de margen

    try {
        if (server) {
            console.log('Cerrando servidor HTTP...');
            await new Promise((resolve, reject) => {
                server.close((err) => {
                    if (err) {
                        console.error('Error al cerrar el servidor HTTP:', err);
                        return reject(err);
                    }
                    resolve();
                });
            });
            console.log('✅ Servidor HTTP cerrado.');
        }

        if (db && db.sequelize) {
            console.log('Cerrando conexión con la base de datos...');
            await db.sequelize.close();
            console.log('✅ Conexión con la base de datos cerrada.');
        }

        clearTimeout(shutdownTimer);
        console.log('✅ Apagado completado con éxito.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error durante el apagado:', error);
        clearTimeout(shutdownTimer);
        process.exit(1);
    }
};

process.on('message', (msg) => {
  if (msg === 'shutdown') {
    gracefulShutdown();
  }
});

// Escuchar SIGINT (Ctrl+C en la terminal) y SIGTERM (señal de 'kill' estándar)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;