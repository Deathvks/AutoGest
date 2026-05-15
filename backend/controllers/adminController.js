// autogest-app/backend/controllers/adminController.js
const { User, Notification, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (GET /api/admin/users)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
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

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está en uso.' });
        }

        const assignedRole = role === 'admin' ? 'admin' : 'user';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: assignedRole,
            isVerified: true,
        });

        const userResponse = newUser.toJSON();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el usuario.' });
    }
};

// Actualizar un usuario (PUT /api/admin/users/:id)
exports.updateUser = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, email, role, password } = req.body;
        const userToUpdate = await User.findByPk(req.params.id, { transaction });
        const requester = req.user;

        if (!userToUpdate) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        userToUpdate.name = name !== undefined ? name : userToUpdate.name;
        userToUpdate.email = email !== undefined ? email : userToUpdate.email;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            userToUpdate.password = await bcrypt.hash(password, salt);
        }

        if (userToUpdate.id === requester.id && userToUpdate.role === 'admin' && role !== 'admin') {
            const adminCount = await User.count({ where: { role: 'admin' }, transaction });
            if (adminCount <= 1) {
                await transaction.rollback();
                return res.status(400).json({ error: 'No puedes eliminar el rol del último administrador.' });
            }
        }

        if (role !== undefined) {
            userToUpdate.role = role === 'admin' ? 'admin' : 'user';
        }

        await userToUpdate.save({ transaction });

        await transaction.commit();

        const userResponse = userToUpdate.toJSON();
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el usuario.' });
    }
};

// Eliminar un usuario (DELETE /api/admin/users/:id)
exports.deleteUser = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const userToDelete = await User.findByPk(req.params.id, { transaction });
        const requester = req.user;

        if (!userToDelete) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        if (userToDelete.id === requester.id) {
            await transaction.rollback();
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
        }

        await userToDelete.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el usuario.' });
    }
};