// autogest-app/backend/controllers/userAccountController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// --- INICIO DE LA MODIFICACIÓN ---
const { User, Invitation } = require('../models'); // Se añade Invitation
// --- FIN DE LA MODIFICACIÓN ---
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailUtils');
const crypto = require('crypto');

// Registrar un nuevo usuario (POST /api/auth/register)
exports.register = async (req, res) => {
    console.log('[REGISTER] Iniciando proceso de registro...');
    try {
        const { name, email, password } = req.body;
        console.log(`[REGISTER] Datos recibidos: ${name}, ${email}`);

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.isVerified) {
            console.log('[REGISTER] Error: El email ya está en uso.');
            return res.status(400).json({ error: 'El email ya está en uso.' });
        }
        
        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userToVerify;

        if (existingUser && !existingUser.isVerified) {
            await existingUser.update({ name, password: hashedPassword, verificationCode });
            userToVerify = existingUser;
        } else {
            userToVerify = await User.create({ name, email, password: hashedPassword, verificationCode, isVerified: false });
        }
        
        console.log('[REGISTER] Usuario creado/actualizado en BBDD. Procediendo a enviar email...');
        await sendVerificationEmail(email, verificationCode);
        console.log('[REGISTER] La función sendVerificationEmail se completó.');

        res.status(201).json({ 
            message: 'Se ha enviado un código de verificación a tu correo. Por favor, úsalo para activar tu cuenta.'
        });

    } catch (error) {
        console.error("--- ERROR DETALLADO EN REGISTRO ---");
        console.error(error);
        console.error("------------------------------------");
        res.status(500).json({ error: 'Error en el registro de usuario.' });
    }
};

// Verificar el email del usuario (POST /api/auth/verify)
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code, newEmail } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado o código incorrecto.' });
        if (user.isVerified) return res.status(400).json({ error: 'Esta cuenta ya ha sido verificada.' });
        if (user.verificationCode !== code.toUpperCase()) return res.status(400).json({ error: 'El código de verificación es incorrecto.' });
        
        if (newEmail && newEmail !== email) {
            const isNewEmailInUse = await User.findOne({ where: { email: newEmail } });
            if (isNewEmailInUse) return res.status(400).json({ error: 'La nueva dirección de correo ya está en uso.' });
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

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ 
                error: 'Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico.',
                needsVerification: true,
                email: user.email
            });
        }

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        // --- INICIO DE LA MODIFICACIÓN ---
        // Comprobar si hay una invitación pendiente para este email
        const pendingInvitation = await Invitation.findOne({
            where: {
                email: user.email,
                status: 'pending',
                expiresAt: { [require('sequelize').Op.gt]: new Date() }
            }
        });

        const response = { token };
        if (pendingInvitation) {
            response.invitationToken = pendingInvitation.token;
        }

        res.status(200).json(response);
        // --- FIN DE LA MODIFICACIÓN ---

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

        if (!user) return res.status(404).json({ error: 'No se encontró una cuenta con ese email.' });
        if (user.isVerified) return res.status(400).json({ error: 'Esta cuenta ya está verificada.' });
        
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
    console.log('[FORCE_VERIFY] Iniciando proceso de forzar verificación...');
    try {
        const { currentEmail, newEmail } = req.body;
        console.log(`[FORCE_VERIFY] Datos recibidos: currentEmail=${currentEmail}, newEmail=${newEmail}`);
        
        const emailToSend = newEmail || currentEmail;
        const user = await User.findOne({ where: { email: currentEmail } });

        if (!user) {
            console.log(`[FORCE_VERIFY] Usuario no encontrado para el email: ${currentEmail}`);
            return res.status(404).json({ error: 'No se encontró una cuenta con ese email.' });
        }
        if (user.isVerified) {
            console.log(`[FORCE_VERIFY] La cuenta para ${currentEmail} ya está verificada.`);
            return res.status(400).json({ error: 'Esta cuenta ya está verificada.' });
        }
        if (newEmail && newEmail !== currentEmail) {
            const existingVerifiedUser = await User.findOne({ where: { email: newEmail, isVerified: true } });
            if (existingVerifiedUser) {
                console.log(`[FORCE_VERIFY] El nuevo email ${newEmail} ya está en uso.`);
                return res.status(400).json({ error: 'La nueva dirección de correo ya está en uso.' });
            }
        }
        
        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        user.verificationCode = verificationCode;
        await user.save();
        console.log(`[FORCE_VERIFY] Nuevo código de verificación generado: ${verificationCode}`);

        console.log(`[FORCE_VERIFY] Procediendo a enviar email a: ${emailToSend}`);
        await sendVerificationEmail(emailToSend, verificationCode);
        console.log(`[FORCE_VERIFY] La función sendVerificationEmail se completó.`);

        res.status(200).json({ message: `Se ha enviado un código de verificación a ${emailToSend}.` });

    } catch (error) {
        console.error("--- ERROR DETALLADO EN FORCE_VERIFY ---");
        console.error(error);
        console.error("---------------------------------------");
        res.status(500).json({ error: 'Error al enviar el código de verificación.' });
    }
};

// @desc    Solicitar restablecimiento de contraseña
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

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
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};