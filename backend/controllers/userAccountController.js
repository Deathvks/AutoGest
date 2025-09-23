// autogest-app/backend/controllers/userAccountController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendVerificationEmail } = require('../utils/emailUtils'); // <-- AÑADIDO
const crypto = require('crypto'); // <-- AÑADIDO

// Registrar un nuevo usuario (POST /api/auth/register)
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Buscar si ya existe un usuario con ese email
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: 'El email ya está en uso.' });
        }
        
        // 2. Generar código y hashear contraseña
        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userToVerify;

        if (existingUser && !existingUser.isVerified) {
            // Si el usuario existe pero no está verificado, actualizamos sus datos y el código
            await existingUser.update({
                name,
                password: hashedPassword,
                verificationCode,
            });
            userToVerify = existingUser;
        } else {
            // Si no existe, lo creamos
            userToVerify = await User.create({
                name,
                email,
                password: hashedPassword,
                verificationCode,
                isVerified: false, 
            });
        }
        
        // 3. Enviar el email de verificación
        await sendVerificationEmail(email, verificationCode);

        // 4. Devolver respuesta exitosa (sin token)
        res.status(201).json({ 
            message: 'Se ha enviado un código de verificación a tu correo. Por favor, úsalo para activar tu cuenta.'
        });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: 'Error en el registro de usuario.' });
    }
};

// --- FUNCIÓN NUEVA ---
// Verificar el email del usuario (POST /api/auth/verify)
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado o código incorrecto.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ error: 'Esta cuenta ya ha sido verificada.' });
        }
        if (user.verificationCode !== code.toUpperCase()) {
            return res.status(400).json({ error: 'El código de verificación es incorrecto.' });
        }

        // Marcar como verificado y limpiar el código
        user.isVerified = true;
        user.verificationCode = null;
        await user.save();

        res.status(200).json({ message: '¡Cuenta verificada con éxito! Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error("Error en la verificación:", error);
        res.status(500).json({ error: 'Error al verificar la cuenta.' });
    }
};
// --- FIN FUNCIÓN NUEVA ---


// Iniciar sesión (POST /api/auth/login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'No existe una cuenta con este email.' });
        }
        
        // --- INICIO DE LA MODIFICACIÓN ---
        // Comprobar si la cuenta está verificada
        if (!user.isVerified) {
            return res.status(401).json({ 
                error: 'Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico.',
                needsVerification: true, // Enviamos una bandera para el frontend
                email: user.email // Devolvemos el email para poder reenviar el código
            });
        }
        // --- FIN DE LA MODIFICACIÓN ---

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'La contraseña es incorrecta.' });
        }

        const payload = {
            id: user.id,
            role: user.role,
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el inicio de sesión.' });
    }
};

// --- FUNCIÓN NUEVA ---
// Reenviar código de verificación
exports.resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'No se encontró una cuenta con ese email.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ error: 'Esta cuenta ya está verificada.' });
        }
        
        // Generar y guardar un nuevo código
        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        user.verificationCode = verificationCode;
        await user.save();

        // Enviar el nuevo código por email
        await sendVerificationEmail(email, verificationCode);

        res.status(200).json({ message: 'Se ha reenviado un nuevo código de verificación a tu correo.' });

    } catch (error) {
        console.error("Error al reenviar el código:", error);
        res.status(500).json({ error: 'Error al reenviar el código.' });
    }
};
// --- FIN FUNCIÓN NUEVA ---