// autogest-app/backend/controllers/authController.js
const { User, Car, Expense, Incident, Location, sequelize } = require('../models'); // Importamos todos los modelos y sequelize
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
            return res.status(401).json({ error: 'No existe una cuenta con este email.' });
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

        // Actualizar nombre y email si se proporcionan
        if (name) user.name = name;
        if (email) user.email = email;

        // Manejar la subida del avatar si se proporciona
        if (req.file) {
            const oldAvatarUrl = user.avatarUrl;
            const newAvatarUrl = `/avatars/${req.file.filename}`;
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
            avatarUrl: user.avatarUrl,
        };

        res.status(200).json(userResponse);
    } catch (error) {
        console.error('Error en updateProfile:', error);
        
        // Manejar errores específicos de Multer
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.' 
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
                error: 'Tipo de archivo no permitido. Solo se aceptan imágenes.' 
            });
        }
        
        if (error.message && error.message.includes('Solo se permiten')) {
            return res.status(400).json({ 
                error: error.message 
            });
        }
        
        // Error genérico
        res.status(500).json({ error: 'Error interno del servidor al actualizar el perfil.' });
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

// Cambiar la contraseña del usuario (PUT /api/auth/update-password)
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la contraseña.' });
    }
};

// Eliminar la cuenta del usuario y todos sus datos asociados
exports.deleteAccount = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = req.user.id;

        // 1. Encontrar todos los coches del usuario para borrar sus archivos
        const cars = await Car.findAll({ where: { userId }, transaction });
        for (const car of cars) {
            if (car.imageUrl) {
                const imageFilename = path.basename(car.imageUrl);
                const imageFilePath = path.join(__dirname, '..', 'public', 'uploads', imageFilename);
                if (fs.existsSync(imageFilePath)) fs.unlinkSync(imageFilePath);
            }
            if (car.registrationDocumentUrl) {
                const docFilename = path.basename(car.registrationDocumentUrl);
                const docFilePath = path.join(__dirname, '..', 'public', 'documents', docFilename);
                if (fs.existsSync(docFilePath)) fs.unlinkSync(docFilePath);
            }
        }

        // 2. Eliminar datos asociados en cascada (gracias a las relaciones del modelo)
        await Incident.destroy({ where: { carId: cars.map(c => c.id) }, transaction });
        await Expense.destroy({ where: { carLicensePlate: cars.map(c => c.licensePlate) }, transaction });
        await Car.destroy({ where: { userId }, transaction });
        await Location.destroy({ where: { userId }, transaction });
        
        // 3. Eliminar el avatar del usuario si existe
        if (req.user.avatarUrl) {
            const avatarFilename = path.basename(req.user.avatarUrl);
            const avatarFilePath = path.join(__dirname, '..', 'public', 'avatars', avatarFilename);
            if (fs.existsSync(avatarFilePath)) {
                fs.unlinkSync(avatarFilePath);
            }
        }

        // 4. Finalmente, eliminar al usuario
        await User.destroy({ where: { id: userId }, transaction });

        // Si todo ha ido bien, confirmamos la transacción
        await transaction.commit();

        res.status(200).json({ message: 'Cuenta eliminada permanentemente con éxito.' });

    } catch (error) {
        // Si algo falla, revertimos todos los cambios
        await transaction.rollback();
        console.error('Error al eliminar la cuenta:', error);
        res.status(500).json({ error: 'Error en el servidor al intentar eliminar la cuenta.' });
    }
};