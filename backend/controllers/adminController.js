// autogest-app/backend/controllers/adminController.js
const { User, Company, Notification, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (GET /api/admin/users)
exports.getAllUsers = async (req, res) => {
    try {
        let whereClause = {};
        const requester = req.user;

        if (requester.role === 'technician' || requester.role === 'technician_subscribed' || requester.canExpelUsers) {
            if (!requester.companyId) {
                whereClause = { id: requester.id };
            } else {
                whereClause = { companyId: requester.companyId };
            }
        }

        let users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
        });

        if (requester.companyId) {
            const company = await Company.findByPk(requester.companyId);
            if (company) {
                const ownerId = company.ownerId;
                users = users.map(user => {
                    const userJson = user.toJSON();
                    userJson.isOwner = (userJson.id === ownerId);
                    return userJson;
                });
            }
        }

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
        const requester = req.user;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está en uso.' });
        }

        let assignedRole = 'user';
        let assignedCompanyId = null;

        if (requester.role === 'admin' && role) {
            assignedRole = role;
        } else if (requester.role === 'technician' || requester.role === 'technician_subscribed') {
            const allowedRolesForTechnician = ['user', 'technician_subscribed'];
            if (requester.role === 'technician') {
                allowedRolesForTechnician.push('technician');
            }

            if (role && !allowedRolesForTechnician.includes(role)) {
                return res.status(403).json({ error: 'No tienes permiso para asignar este rol.' });
            }
            assignedRole = role || 'user';
            assignedCompanyId = requester.companyId;
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: assignedRole,
            companyId: assignedCompanyId,
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
        const { name, email, role, password, canManageRoles, canExpelUsers } = req.body;
        const userToUpdate = await User.findByPk(req.params.id, { transaction });
        const requester = req.user;

        if (!userToUpdate) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        
        if (requester.role === 'technician' || requester.role === 'technician_subscribed') {
            if (userToUpdate.id === requester.id) {
                await transaction.rollback();
                return res.status(403).json({ error: 'Edita tu propio perfil desde la sección "Mi Perfil".' });
            }

            if (userToUpdate.companyId !== requester.companyId) {
                await transaction.rollback();
                return res.status(403).json({ error: 'No puedes editar usuarios que no pertenecen a tu equipo.' });
            }

            const company = await Company.findOne({ where: { id: requester.companyId }, transaction });
            if (company && userToUpdate.id === company.ownerId) {
                 await transaction.rollback();
                 return res.status(403).json({ error: 'No puedes editar al propietario del equipo.' });
            }
            
            const isRequesterOwner = company && company.ownerId === requester.id;
            if (!isRequesterOwner) {
                await transaction.rollback();
                return res.status(403).json({ error: 'No tienes permiso para editar usuarios.' });
            }
            
            if (name || email || password || role) {
                await transaction.rollback();
                return res.status(403).json({ error: 'Desde aquí, solo puedes modificar los permisos de un usuario.' });
            }
            
            if (canManageRoles !== undefined) {
                 await transaction.rollback();
                 return res.status(403).json({ error: 'La gestión de roles no se puede delegar.' });
            }
        }
        
        if (requester.role === 'admin') {
            userToUpdate.name = name !== undefined ? name : userToUpdate.name;
            userToUpdate.email = email !== undefined ? email : userToUpdate.email;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                userToUpdate.password = await bcrypt.hash(password, salt);
            }
        }

        if (userToUpdate.id === requester.id && userToUpdate.role === 'admin' && role !== 'admin') {
            const adminCount = await User.count({ where: { role: 'admin' }, transaction });
            if (adminCount <= 1) {
                await transaction.rollback();
                return res.status(400).json({ error: 'No puedes eliminar el rol del último administrador.' });
            }
        }
        
        if (role !== undefined) {
            userToUpdate.role = role;
        }
        
        if (canManageRoles !== undefined) {
            userToUpdate.canManageRoles = canManageRoles;
        }
        
        if (canExpelUsers !== undefined) {
            // --- INICIO DE LA MODIFICACIÓN ---
            const wasJustGranted = canExpelUsers === true && !userToUpdate.canExpelUsers;
            userToUpdate.canExpelUsers = canExpelUsers;

            if (wasJustGranted) {
                await Notification.create({
                    userId: userToUpdate.id,
                    message: `Se te han concedido permisos para expulsar a otros miembros del equipo.`,
                    type: 'general'
                }, { transaction });
            }
            // --- FIN DE LA MODIFICACIÓN ---
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
        
        const ownedCompany = await Company.findOne({ where: { ownerId: userToDelete.id }, transaction });
        if (ownedCompany) {
            await User.update(
                { 
                    companyId: null,
                    canManageRoles: false,
                    canExpelUsers: false 
                },
                { where: { companyId: ownedCompany.id }, transaction }
            );

            await ownedCompany.destroy({ transaction });
        }
        
        if (requester.role === 'technician' || requester.role === 'technician_subscribed') {
            if (userToDelete.companyId !== requester.companyId) {
                await transaction.rollback();
                return res.status(403).json({ error: 'No puedes eliminar usuarios que no pertenecen a tu empresa.' });
            }
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