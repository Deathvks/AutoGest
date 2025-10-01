// autogest-app/backend/controllers/adminController.js
const { User, Company } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (GET /api/admin/users)
exports.getAllUsers = async (req, res) => {
    try {
        let whereClause = {};
        const requester = req.user;

        // --- INICIO DE LA MODIFICACIÓN ---
        // Si el solicitante es un técnico, tiene suscripción, o tiene permiso para expulsar,
        // se le mostrarán los usuarios de su compañía.
        if (requester.role === 'technician' || requester.role === 'technician_subscribed' || requester.canExpelUsers) {
            if (!requester.companyId) {
                // Si no tiene compañía (por alguna razón), solo se ve a sí mismo.
                whereClause = { id: requester.id };
            } else {
                // Muestra todos los usuarios de la misma compañía.
                whereClause = { companyId: requester.companyId };
            }
        }
        // El admin (sin 'whereClause') ve a todos los usuarios.
        // --- FIN DE LA MODIFICACIÓN ---

        const users = await User.findAll({
            where: whereClause,
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
    try {
        const { name, email, role, password, canManageRoles, canExpelUsers } = req.body;
        const userToUpdate = await User.findByPk(req.params.id);
        const requester = req.user;

        if (!userToUpdate) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        
        // --- INICIO DE LA MODIFICACIÓN ---
        // Lógica de permisos para técnicos y usuarios con permiso de expulsión
        if (requester.role === 'technician' || requester.role === 'technician_subscribed' || requester.canExpelUsers) {
            if (userToUpdate.id === requester.id) {
                return res.status(403).json({ error: 'Edita tu propio perfil desde la sección "Mi Perfil".' });
            }

            if (userToUpdate.companyId !== requester.companyId) {
                return res.status(403).json({ error: 'No puedes editar usuarios que no pertenecen a tu equipo.' });
            }

            const company = await Company.findOne({ where: { id: requester.companyId } });
            if (company && userToUpdate.id === company.ownerId) {
                 return res.status(403).json({ error: 'No puedes editar al propietario del equipo.' });
            }
            
            // Un técnico o un usuario solo pueden editar permisos si son propietarios o tienen el permiso de gestionar roles
            if (!requester.isOwner && !requester.canManageRoles) {
                return res.status(403).json({ error: 'No tienes permiso para editar usuarios.' });
            }

            // No pueden cambiar datos personales ni contraseña
            if (name || email || password) {
                return res.status(403).json({ error: 'Solo puedes modificar los permisos de un usuario.' });
            }

            // Solo el propietario puede cambiar el rol o el permiso de gestionar roles.
            if (!requester.isOwner && (role !== undefined || canManageRoles !== undefined)) {
                return res.status(403).json({ error: 'Solo el propietario del equipo puede cambiar roles o asignar permisos de gestión.' });
            }

            const isOriginalTechnician = userToUpdate.previousRole === 'technician' || userToUpdate.previousRole === 'technician_subscribed';
            if (isOriginalTechnician && role === 'user') {
                return res.status(403).json({ error: 'No se puede quitar el rol de técnico a un usuario que ya lo era.' });
            }

            const allowedRolesToAssign = ['user', 'technician_subscribed'];
            if (requester.role === 'technician') {
                allowedRolesToAssign.push('technician');
            }
            if (role && !allowedRolesToAssign.includes(role)) {
                return res.status(403).json({ error: 'No puedes asignar el rol seleccionado.' });
            }
        }
        // --- FIN DE LA MODIFICACIÓN ---
        
        if (requester.role === 'admin') {
            userToUpdate.name = name !== undefined ? name : userToUpdate.name;
            userToUpdate.email = email !== undefined ? email : userToUpdate.email;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                userToUpdate.password = await bcrypt.hash(password, salt);
            }
        }

        if (userToUpdate.id === requester.id && userToUpdate.role === 'admin' && role !== 'admin') {
            const adminCount = await User.count({ where: { role: 'admin' } });
            if (adminCount <= 1) {
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
            userToUpdate.canExpelUsers = canExpelUsers;
        }

        await userToUpdate.save();
        
        const userResponse = userToUpdate.toJSON();
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el usuario.' });
    }
};

// Eliminar un usuario (DELETE /api/admin/users/:id)
exports.deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findByPk(req.params.id);
        const requester = req.user;

        if (!userToDelete) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        if (userToDelete.id === requester.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
        }
        
        if (requester.role === 'technician' || requester.role === 'technician_subscribed') {
            if (userToDelete.companyId !== requester.companyId) {
                return res.status(403).json({ error: 'No puedes eliminar usuarios que no pertenecen a tu empresa.' });
            }
            const company = await Company.findOne({ where: { id: requester.companyId } });
            if (company && userToDelete.id === company.ownerId) {
                 return res.status(403).json({ error: 'No puedes eliminar al propietario de la empresa.' });
            }
        }

        await userToDelete.destroy();
        res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el usuario.' });
    }
};