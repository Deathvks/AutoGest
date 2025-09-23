// autogest-app/backend/controllers/adminController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (GET /api/admin/users)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // Nunca devolver la contraseña
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los usuarios.' });
    }
};

// Crear un nuevo usuario (POST /api/admin/users)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

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
            isVerified: true, // Los usuarios creados por un admin se marcan como verificados
        });

        // --- INICIO DE LA MODIFICACIÓN ---
        // Se devuelve el objeto de usuario completo para mantener la consistencia en el frontend
        const userResponse = newUser.toJSON();
        delete userResponse.password;
        // --- FIN DE LA MODIFICACIÓN ---

        res.status(201).json(userResponse);
    } catch (error)
        {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el usuario.' });
    }
};

// Actualizar un usuario (PUT /api/admin/users/:id)
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // No permitir que un admin se quite el rol a sí mismo si es el último
        if (user.id === req.user.id && user.role === 'admin' && role !== 'admin') {
            const adminCount = await User.count({ where: { role: 'admin' } });
            if (adminCount <= 1) {
                return res.status(400).json({ error: 'No puedes eliminar el rol del último administrador.' });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        
        // --- INICIO DE LA MODIFICACIÓN ---
        // Se devuelve el objeto de usuario completo para mantener la consistencia en el frontend
        const userResponse = user.toJSON();
        delete userResponse.password;
        // --- FIN DE LA MODIFICACIÓN ---

        res.status(200).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el usuario.' });
    }
};

// Eliminar un usuario (DELETE /api/admin/users/:id)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta desde el panel de administración.' });
        }

        await user.destroy();
        res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el usuario.' });
    }
};