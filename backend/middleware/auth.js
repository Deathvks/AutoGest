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
// Middleware para verificar si el usuario tiene una suscripción activa, un período de prueba válido, o pertenece a un equipo.
const checkSubscription = (req, res, next) => {
    const user = req.user;

    // 1. Permite el acceso a administradores y técnicos sin suscripción.
    const exemptedRoles = ['admin', 'technician'];
    if (exemptedRoles.includes(user.role)) {
        return next();
    }

    // 2. Si el usuario pertenece a una compañía, se asume que opera bajo la suscripción del propietario.
    if (user.companyId) {
        return next();
    }

    // 3. Si no pertenece a una compañía, debe tener su propia suscripción o prueba.
    const isSubscriptionActive = user.subscriptionStatus === 'active';
    const isTrialActive = user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date();

    if (isSubscriptionActive || isTrialActive) {
        next(); // El usuario tiene acceso por sí mismo.
    } else {
        // 4. Si ninguna condición se cumple, se deniega el acceso.
        res.status(403).json({ 
            error: 'Acceso denegado. Se requiere una suscripción activa o un período de prueba válido.',
            subscriptionRequired: true 
        });
    }
};
// --- FIN DE LA MODIFICACIÓN ---

module.exports = { protect, admin, checkSubscription };