// autogest-app/backend/controllers/adminController.js
const { User, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const stripe = require('./subscription/stripeConfig');

const VALID_ROLES = ['user', 'admin', 'technician', 'technician_subscribed'];

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios.' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Faltan datos obligatorios.' });

        if (await User.findOne({ where: { email } })) return res.status(400).json({ error: 'Email en uso.' });

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const newUser = await User.create({ 
            name, email, password: hashedPassword, 
            role: VALID_ROLES.includes(role) ? role : 'user', 
            isVerified: true 
        });
        
        const userResponse = newUser.toJSON();
        delete userResponse.password;
        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el usuario.' });
    }
};

exports.updateUser = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, email, role, password } = req.body;
        const userToUpdate = await User.findByPk(req.params.id, { transaction });

        if (!userToUpdate) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        if (name !== undefined) userToUpdate.name = name;
        if (email !== undefined) userToUpdate.email = email;
        if (password) userToUpdate.password = await bcrypt.hash(password, await bcrypt.genSalt(10));

        if (userToUpdate.id === req.user.id && userToUpdate.role === 'admin' && role !== 'admin') {
            if (await User.count({ where: { role: 'admin' }, transaction }) <= 1) {
                await transaction.rollback();
                return res.status(400).json({ error: 'No puedes eliminar al último administrador.' });
            }
        }

        if (role !== undefined) userToUpdate.role = VALID_ROLES.includes(role) ? role : 'user';

        await userToUpdate.save({ transaction });
        await transaction.commit();

        const userResponse = userToUpdate.toJSON();
        delete userResponse.password;
        res.status(200).json(userResponse);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: 'Error al actualizar.' });
    }
};

exports.deleteUser = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const userToDelete = await User.findByPk(req.params.id, { transaction });
        
        if (!userToDelete) {
            await transaction.rollback();
            return res.status(404).json({ error: 'No encontrado.' });
        }
        if (userToDelete.id === req.user.id) {
            await transaction.rollback();
            return res.status(400).json({ error: 'No puedes eliminarte a ti mismo.' });
        }

        await userToDelete.destroy({ transaction });
        await transaction.commit();
        res.status(200).json({ message: 'Usuario eliminado.' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: 'Error al eliminar.' });
    }
};

exports.bulkUpdateRoles = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { role } = req.body;
        if (!VALID_ROLES.includes(role) || role === 'admin') {
            await transaction.rollback();
            return res.status(400).json({ error: 'Rol no válido.' });
        }

        await User.update({ role }, { where: { role: { [Op.ne]: 'admin' } }, transaction });
        await transaction.commit();
        res.status(200).json({ message: 'Usuarios actualizados.' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: 'Error al actualizar roles masivamente.' });
    }
};

exports.extendTrial = async (req, res) => {
    try {
        const { days } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

        let currentExpiry = user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date()
            ? new Date(user.trialExpiresAt)
            : new Date();

        currentExpiry.setDate(currentExpiry.getDate() + (days || 7));
        user.trialExpiresAt = currentExpiry;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al extender la prueba.' });
    }
};

exports.forceSyncSubscription = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
        if (!user.stripeCustomerId) return res.status(400).json({ error: 'Sin cliente Stripe asociado.' });

        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'all',
            limit: 1,
        });

        if (subscriptions.data.length > 0) {
            const sub = subscriptions.data[0];
            user.subscriptionStatus = sub.status;
            user.subscriptionExpiry = new Date(sub.current_period_end * 1000);
        } else {
            user.subscriptionStatus = 'inactive';
            user.subscriptionExpiry = null;
        }
        
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al sincronizar la suscripción.' });
    }
};

exports.getUserTransactions = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
        if (!user.stripeCustomerId) return res.status(200).json([]);

        const invoices = await stripe.invoices.list({
            customer: user.stripeCustomerId,
            limit: 10,
        });

        const transactions = invoices.data.map(inv => ({
            id: inv.id,
            amount: inv.amount_paid / 100,
            currency: inv.currency,
            status: inv.status,
            date: new Date(inv.created * 1000),
            pdf: inv.invoice_pdf,
            url: inv.hosted_invoice_url
        }));

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener transacciones.' });
    }
};