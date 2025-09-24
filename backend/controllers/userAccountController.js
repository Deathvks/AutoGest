// autogest-app/backend/controllers/userAccountController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
// --- INICIO DE LA MODIFICACIÓN ---
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailUtils');
// --- FIN DE LA MODIFICACIÓN ---
const crypto = require('crypto');

// Registrar un nuevo usuario (POST /api/auth/register)
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: 'El email ya está en uso.' });
        }
        
        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userToVerify;

        if (existingUser && !existingUser.isVerified) {
            await existingUser.update({
                name,
                password: hashedPassword,
                verificationCode,
            });
            userToVerify = existingUser;
        } else {
            userToVerify = await User.create({
                name,
                email,
                password: hashedPassword,
                verificationCode,
                isVerified: false, 
            });
        }
        
        await sendVerificationEmail(email, verificationCode);

        res.status(201).json({ 
            message: 'Se ha enviado un código de verificación a tu correo. Por favor, úsalo para activar tu cuenta.'
        });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: 'Error en el registro de usuario.' });
    }
};

// Verificar el email del usuario (POST /api/auth/verify)
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code, newEmail } = req.body;

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
        
        if (newEmail && newEmail !== email) {
            const isNewEmailInUse = await User.findOne({ where: { email: newEmail } });
            if (isNewEmailInUse) {
                return res.status(400).json({ error: 'La nueva dirección de correo ya está en uso.' });
            }
            user.email = newEmail;
        }

        user.isVerified = true;
        user.verificationCode = null;
        await user.save();

        res.status(200).json({ message: '¡Cuenta verificada con éxito! Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error("Error en la verificación:", error);
        res.status(500).json({ error: 'Error al verificar la cuenta.' });
    }
};


// Iniciar sesión (POST /api/auth/login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'No existe una cuenta con este email.' });
        }
        
        if (!user.isVerified) {
            return res.status(401).json({ 
                error: 'Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico.',
                needsVerification: true,
                email: user.email
            });
        }

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
        
        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        user.verificationCode = verificationCode;
        await user.save();

        await sendVerificationEmail(email, verificationCode);

        res.status(200).json({ message: 'Se ha reenviado un nuevo código de verificación a tu correo.' });

    } catch (error) {
        console.error("Error al reenviar el código:", error);
        res.status(500).json({ error: 'Error al reenviar el código.' });
    }
};

// Forzar verificación para usuarios existentes no verificados
exports.forceVerification = async (req, res) => {
    try {
        const { currentEmail, newEmail } = req.body;
        const emailToSend = newEmail || currentEmail;

        const user = await User.findOne({ where: { email: currentEmail } });

        if (!user) {
            return res.status(404).json({ error: 'No se encontró una cuenta con ese email.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ error: 'Esta cuenta ya está verificada.' });
        }

        if (newEmail && newEmail !== currentEmail) {
            const existingVerifiedUser = await User.findOne({ where: { email: newEmail, isVerified: true } });
            if (existingVerifiedUser) {
                return res.status(400).json({ error: 'La nueva dirección de correo ya está en uso.' });
            }
        }
        
        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        user.verificationCode = verificationCode;
        await user.save();

        await sendVerificationEmail(emailToSend, verificationCode);

        res.status(200).json({ 
            message: `Se ha enviado un código de verificación a ${emailToSend}.`
        });

    } catch (error) {
        console.error("Error al forzar la verificación:", error);
        res.status(500).json({ error: 'Error al enviar el código de verificación.' });
    }
};

// --- INICIO DE LA MODIFICACIÓN ---
// @desc    Solicitar restablecimiento de contraseña
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Nota: No revelamos si el email existe o no por seguridad.
            return res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.' });
        }

        // Generar token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Guardar el token hasheado y la fecha de expiración en la BBDD
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora de validez

        await user.save();

        // Enviar email
        await sendPasswordResetEmail(user.email, resetToken);

        res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.' });

    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// @desc    Restablecer la contraseña
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Buscar usuario por el token hasheado y verificar que no haya expirado
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { [require('sequelize').Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'El enlace para restablecer la contraseña es inválido o ha expirado.' });
        }

        // Validar nueva contraseña
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }

        // Establecer la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.isVerified = true; // Verificamos la cuenta si estaba pendiente

        await user.save();

        res.status(200).json({ message: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
// --- FIN DE LA MODIFICACIÓN ---