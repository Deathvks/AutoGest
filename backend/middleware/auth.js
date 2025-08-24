const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware 1: Proteger rutas verificando el token
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extraer el token del header
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar la validez del token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Buscar al usuario por el ID del token
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            // --- ESTA ES LA CORRECCIÓN CLAVE ---
            // 4. Si el usuario no se encuentra (fue eliminado), denegar acceso
            if (!req.user) {
                return res.status(401).json({ error: 'No autorizado, el usuario ya no existe.' });
            }
            // ------------------------------------

            next(); // El usuario existe y está autenticado, puede continuar
        } catch (error) {
            console.error(error);
            return res.status(401).json({ error: 'No autorizado, token inválido.' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'No autorizado, no se encontró token.' });
    }
};

// Middleware 2: Autorizar por rol de usuario
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `El rol '${req.user.role}' no tiene permiso para realizar esta acción.` 
            });
        }
        next();
    };
};