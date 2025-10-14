// autogest-app/backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware para proteger rutas verificando el token
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Adjunta el usuario completo al objeto request para uso posterior
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                return res.status(401).json({ error: 'No autorizado, usuario no encontrado.' });
            }
            next();
        } catch (error) {
            console.error('Error de autenticación:', error);
            res.status(401).json({ error: 'No autorizado, token fallido.' });
        }
    }
    if (!token) {
        res.status(401).json({ error: 'No autorizado, no hay token.' });
    }
};

// Middleware para administradores
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};

// --- INICIO DE LA MODIFICACIÓN ---
// Middleware para verificar si el usuario tiene una suscripción activa o un período de prueba válido
const checkSubscription = (req, res, next) => {
    const user = req.user;

    // Permite el acceso a administradores y técnicos sin necesidad de suscripción
    const exemptedRoles = ['admin', 'technician', 'technician_subscribed'];
    if (exemptedRoles.includes(user.role)) {
        return next();
    }

    // Comprueba si la suscripción está activa
    const isSubscriptionActive = user.subscriptionStatus === 'active';
    
    // Comprueba si el período de prueba está activo
    const isTrialActive = user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date();

    if (isSubscriptionActive || isTrialActive) {
        next(); // El usuario tiene acceso
    } else {
        res.status(403).json({ 
            error: 'Acceso denegado. Se requiere una suscripción activa o un período de prueba válido.',
            subscriptionRequired: true 
        });
    }
};
// --- FIN DE LA MODIFICACIÓN ---

module.exports = { protect, admin, checkSubscription }; // Se exporta checkSubscription