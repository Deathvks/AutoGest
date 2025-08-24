const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Registrar un nuevo usuario (POST /api/auth/register)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está en uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el registro de usuario.' });
    }
};

// Iniciar sesión (POST /api/auth/login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
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

// Obtener el perfil del usuario actual (GET /api/auth/me)
exports.getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// Actualizar el perfil del usuario (PUT /api/auth/profile)
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const oldAvatarUrl = user.avatarUrl;

        user.name = name || user.name;
        user.email = email || user.email;

        if (req.file) {
            const newAvatarUrl = `${process.env.BACKEND_URL}/avatars/${req.file.filename}`;
            user.avatarUrl = newAvatarUrl;

            if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
                const oldAvatarFilename = path.basename(oldAvatarUrl);
                const oldAvatarFilePath = path.join(__dirname, '..', 'public', 'avatars', oldAvatarFilename);
                if (fs.existsSync(oldAvatarFilePath)) {
                    fs.unlinkSync(oldAvatarFilePath);
                }
            }
        }

        await user.save();

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl
        };

        res.status(200).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el perfil.' });
    }
};

// Eliminar el avatar del usuario (DELETE /api/auth/avatar)
exports.deleteAvatar = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const avatarUrlToDelete = user.avatarUrl;

        if (avatarUrlToDelete) {
            const avatarFilename = path.basename(avatarUrlToDelete);
            const avatarFilePath = path.join(__dirname, '..', 'public', 'avatars', avatarFilename);
            if (fs.existsSync(avatarFilePath)) {
                fs.unlinkSync(avatarFilePath);
            }
        }

        user.avatarUrl = null;
        await user.save();

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl
        };

        res.status(200).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el avatar.' });
    }
};

// --- FUNCIÓN NUEVA ---
// Cambiar la contraseña del usuario (PUT /api/auth/update-password)
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 1. Obtener el usuario completo (con su contraseña) desde la BBDD
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // 2. Verificar que la contraseña actual es correcta
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        // 3. Validar y encriptar la nueva contraseña
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // 4. Guardar los cambios
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la contraseña.' });
    }
};