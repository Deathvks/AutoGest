// autogest-app/backend/controllers/companyController.js
const { User, Company, Invitation, Notification, sequelize } = require('../models');
const { sendInvitationEmail, sendSubscriptionPromptEmail } = require('../utils/emailUtils');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { stripe } = require('../controllers/subscription/stripeConfig');

// Enviar una invitación a un nuevo usuario para unirse a una compañía
exports.inviteUser = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { email: invitedEmail, businessName } = req.body;
        const inviter = req.user;

        const isAllowedRole = inviter.role === 'technician' || inviter.role === 'technician_subscribed' || inviter.role === 'admin';
        if (!isAllowedRole) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Tu rol de usuario no permite crear equipos.' });
        }

        if (inviter.companyId) {
            const company = await Company.findByPk(inviter.companyId, { transaction });
            if (!company || company.ownerId !== inviter.id) {
                await transaction.rollback();
                return res.status(403).json({ error: 'Solo el propietario del equipo puede invitar a nuevos miembros.' });
            }
        }
        
        const existingUser = await User.findOne({ where: { email: invitedEmail } });
        
        if (existingUser) {
            if (existingUser.companyId) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Este usuario ya pertenece a un equipo.' });
            }

        }
        
        let company;
        if (inviter.companyId) {
            company = await Company.findByPk(inviter.companyId);
        } else {
            if (!businessName || businessName.trim() === '') {
                await transaction.rollback();
                return res.status(400).json({ error: 'El nombre de la empresa (Razón Social) es obligatorio para la primera invitación.' });
            }
            company = await Company.create({
                name: businessName,
                ownerId: inviter.id
            }, { transaction });

            await User.update({ 
                companyId: company.id, 
                businessName: company.name, 
                canManageRoles: true, 
                canExpelUsers: true 
            }, { where: { id: inviter.id }, transaction });
        }

        if (!company) {
            await transaction.rollback();
            return res.status(404).json({ error: 'No se pudo encontrar o crear la empresa.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 horas

        await Invitation.create({
            email: invitedEmail,
            token,
            companyId: company.id,
            inviterId: inviter.id,
            status: 'pending',
            expiresAt,
        }, { transaction });

        // --- INICIO DE LA MODIFICACIÓN ---
        // Si el usuario invitado ya existe, le creamos una notificación.
        if (existingUser) {
            await Notification.create({
                userId: existingUser.id,
                message: `${inviter.name} te ha invitado a unirte a su equipo ${company.name}.`,
                type: 'general', // O un tipo más específico como 'invitation'
                link: `/accept-invitation/${token}`
            }, { transaction });
        }
        // --- FIN DE LA MODIFICACIÓN ---

        await sendInvitationEmail(invitedEmail, token, company.name, inviter.name);
        
        await transaction.commit();
        
        res.status(200).json({ message: `Invitación enviada correctamente a ${invitedEmail}.` });

    } catch (error) {
        await transaction.rollback();
        console.error('Error al enviar la invitación:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar la invitación.' });
    }
};

// Verificar un token de invitación
exports.verifyInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await Invitation.findOne({
            where: {
                token: token,
                status: 'pending',
                expiresAt: { [Op.gt]: new Date() }
            },
            include: [{ model: Company, attributes: ['name'] }]
        });

        if (!invitation) {
            return res.status(404).json({ error: 'El enlace de invitación es inválido o ha expirado.' });
        }

        res.status(200).json({
            email: invitation.email,
            companyName: invitation.Company.name
        });

    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Aceptar una invitación y actualizar al usuario existente
exports.acceptInvitation = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { token } = req.body;

        const invitation = await Invitation.findOne({
            where: {
                token: token,
                status: 'pending',
                expiresAt: { [Op.gt]: new Date() }
            },
            include: [{ model: Company, attributes: ['name'] }],
            transaction
        });

        if (!invitation) {
            await transaction.rollback();
            return res.status(400).json({ error: 'El enlace de invitación es inválido o ha expirado.' });
        }
        
        const userToUpdate = await User.findOne({ where: { email: invitation.email }, transaction });
        if (!userToUpdate) {
            await transaction.rollback();
            return res.status(404).json({ error: 'La cuenta de usuario asociada a esta invitación no fue encontrada. Por favor, regístrate primero.' });
        }
        if (userToUpdate.companyId) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Esta cuenta ya pertenece a otro equipo.' });
        }

        if (userToUpdate.subscriptionStatus === 'active' && userToUpdate.stripeCustomerId) {
            const subscriptions = await stripe.subscriptions.list({
                customer: userToUpdate.stripeCustomerId,
                status: 'active',
                limit: 1
            });

            if (subscriptions.data.length > 0) {
                await stripe.subscriptions.cancel(subscriptions.data[0].id);
            }

            userToUpdate.previousRole = userToUpdate.role;
            userToUpdate.role = 'user';
            userToUpdate.subscriptionStatus = 'inactive';
            userToUpdate.subscriptionExpiry = null;
        }

        userToUpdate.companyId = invitation.companyId;
        userToUpdate.businessName = invitation.Company.name;
        await userToUpdate.save({ transaction });

        invitation.status = 'accepted';
        await invitation.save({ transaction });

        // --- INICIO DE LA MODIFICACIÓN ---
        // Notificar al propietario de la empresa que un nuevo miembro se ha unido
        const companyOwner = await User.findByPk(invitation.Company.ownerId, { transaction });
        if (companyOwner) {
            await Notification.create({
                userId: companyOwner.id,
                message: `${userToUpdate.name} se ha unido a tu equipo ${invitation.Company.name}.`,
                type: 'general'
            }, { transaction });
        }
        // --- FIN DE LA MODIFICACIÓN ---

        await transaction.commit();

        res.status(200).json({ message: '¡Te has unido al equipo con éxito! Ya puedes iniciar sesión.' });

    } catch (error) {
        await transaction.rollback();
        console.error('Error al aceptar la invitación:', error);
        res.status(500).json({ error: 'Error interno al procesar la aceptación.' });
    }
};

// Expulsar a un usuario de la compañía
exports.expelUser = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { userIdToExpel } = req.params;
        const requester = req.user;

        if (!requester.companyId) {
            await transaction.rollback();
            return res.status(403).json({ error: 'No perteneces a ninguna empresa.' });
        }

        const company = await Company.findByPk(requester.companyId);
        if (!company || (company.ownerId !== requester.id && !requester.canExpelUsers)) {
            await transaction.rollback();
            return res.status(403).json({ error: 'No tienes permiso para expulsar a miembros de este equipo.' });
        }

        const userToExpel = await User.findByPk(userIdToExpel, { transaction });

        if (!userToExpel || userToExpel.companyId !== requester.companyId) {
            await transaction.rollback();
            return res.status(404).json({ error: 'El usuario no se ha encontrado en tu equipo.' });
        }
        
        if (userToExpel.id === requester.id) {
            await transaction.rollback();
            return res.status(400).json({ error: 'No puedes expulsarte a ti mismo.' });
        }
        
        if (userToExpel.id === company.ownerId) {
            await transaction.rollback();
            return res.status(403).json({ error: 'No se puede expulsar al propietario del equipo.' });
        }
        
        userToExpel.companyId = null;
        userToExpel.canManageRoles = false;
        userToExpel.canExpelUsers = false;
        await userToExpel.save({ transaction });

        // --- INICIO DE LA MODIFICACIÓN ---
        // Notificar al usuario que ha sido expulsado
        await Notification.create({
            userId: userToExpel.id,
            message: `Has sido expulsado del equipo ${company.name}.`,
            type: 'general',
        }, { transaction });
        // --- FIN DE LA MODIFICACIÓN ---

        await transaction.commit();
        
        const userResponse = userToExpel.toJSON();
        delete userResponse.password;
        res.status(200).json(userResponse);

    } catch (error) {
        await transaction.rollback();
        console.error('Error al expulsar al usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar la expulsión.' });
    }
};