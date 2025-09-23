// autogest-app/backend/controllers/userAccountController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

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