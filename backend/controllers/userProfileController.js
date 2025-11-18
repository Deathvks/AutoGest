// autogest-app/backend/controllers/userProfileController.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { User, Car, Expense, Incident, Location, sequelize, Company, Invitation } = require('../models');
const { isValidDniNie, isValidCif } = require('../utils/validation');
const { stripe } = require('./subscription/stripeConfig');

// Obtener el perfil del usuario actual (GET /api/auth/me)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        if (user.trialExpiresAt && new Date(user.trialExpiresAt) < new Date() && user.subscriptionStatus === 'inactive') {
            user.trialExpiresAt = null;
            await user.save();
        }

        const userJson = user.toJSON();

        if (user.companyId) {
            const company = await Company.findByPk(user.companyId, {
                include: [{
                    model: User,
                    as: 'owner',
                    attributes: [
                        'businessName', 'cif', 'dni', 'address', 'phone', 'logoUrl', 
                        'invoiceCounter', 'proformaCounter',
                        'companyStreetAddress', 'companyPostalCode', 'companyCity', 'companyProvince', 'companyPhone',
                        'personalStreetAddress', 'personalPostalCode', 'personalCity', 'personalProvince', 'personalPhone'
                    ]
                }]
            });

            if (company) {
                const isOwner = user.id === company.ownerId;
                userJson.isOwner = isOwner;

                if (!isOwner && company.owner) {
                    // Si es miembro, hereda todos los datos de facturación del propietario.
                    userJson.businessName = company.owner.businessName;
                    userJson.cif = company.owner.cif;
                    userJson.dni = company.owner.dni;
                    userJson.address = company.owner.address; // Dirección genérica completa
                    userJson.phone = company.owner.phone;
                    userJson.logoUrl = company.owner.logoUrl;
                    userJson.invoiceCounter = company.owner.invoiceCounter;
                    userJson.proformaCounter = company.owner.proformaCounter;
                    
                    // Heredar datos desglosados de empresa
                    userJson.companyStreetAddress = company.owner.companyStreetAddress;
                    userJson.companyPostalCode = company.owner.companyPostalCode;
                    userJson.companyCity = company.owner.companyCity;
                    userJson.companyProvince = company.owner.companyProvince;
                    userJson.companyPhone = company.owner.companyPhone;

                    // Heredar datos desglosados personales
                    userJson.personalStreetAddress = company.owner.personalStreetAddress;
                    userJson.personalPostalCode = company.owner.personalPostalCode;
                    userJson.personalCity = company.owner.personalCity;
                    userJson.personalProvince = company.owner.personalProvince;
                    userJson.personalPhone = company.owner.personalPhone;
                }
                 return res.status(200).json(userJson);
            }
        }
        
        userJson.isOwner = !user.companyId;
        res.status(200).json(userJson);

    } catch (error) {
        console.error('Error en getMe:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener el perfil.' });
    }
};

// Obtener la invitación pendiente del usuario actual
exports.getPendingInvitation = async (req, res) => {
    try {
        const invitation = await Invitation.findOne({
            where: {
                email: req.user.email,
                status: 'pending',
                expiresAt: { [require('sequelize').Op.gt]: new Date() }
            },
            include: [{
                model: Company,
                attributes: ['name']
            }]
        });

        if (!invitation) {
            return res.status(200).json(null);
        }

        res.status(200).json({
            token: invitation.token,
            companyName: invitation.Company.name
        });

    } catch (error) {
        console.error('Error al obtener la invitación pendiente:', error);
        res.status(500).json({ error: 'Error al obtener la invitación.' });
    }
};

// Actualizar el perfil del usuario (PUT /api/auth/profile)
exports.updateProfile = async (req, res) => {
    try {
        const { 
            name, email, businessName, dni, cif, 
            companyStreetAddress, companyPostalCode, companyCity, companyProvince, companyPhone,
            personalStreetAddress, personalPostalCode, personalCity, personalProvince, personalPhone,
            proformaCounter, invoiceCounter 
        } = req.body;
        
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        if (user.companyId) {
            const company = await Company.findByPk(user.companyId);
            if (company && company.ownerId !== user.id) {
                return res.status(403).json({ error: 'No tienes permiso para modificar los datos de facturación del equipo.' });
            }
        }

        if (dni && !isValidDniNie(dni)) {
            return res.status(400).json({ error: 'El DNI o NIE introducido no es válido.' });
        }
        if (cif && !isValidCif(cif)) {
            return res.status(400).json({ error: 'El CIF introducido no es válido.' });
        }
        if (email && !validator.isEmail(email)) {
            return res.status(400).json({ error: 'El formato del email no es válido.' });
        }

        if (name && name.trim() !== '') user.name = name;
        if (email && email.trim() !== '') user.email = email;
        
        // Lógica para guardar los datos de forma independiente
        const accountType = (cif && cif.trim() !== '') ? 'empresa' : 'particular';

        if (accountType === 'empresa') {
            user.businessName = businessName;
            user.cif = cif;
            user.dni = null;
            
            if (companyStreetAddress !== undefined) user.companyStreetAddress = companyStreetAddress;
            if (companyPostalCode !== undefined) user.companyPostalCode = companyPostalCode;
            if (companyCity !== undefined) user.companyCity = companyCity;
            if (companyProvince !== undefined) user.companyProvince = companyProvince;
            if (companyPhone !== undefined) user.companyPhone = companyPhone;

            // Construir dirección genérica para compatibilidad
            const addressParts = [companyStreetAddress, companyPostalCode, companyCity, companyProvince].filter(part => part && part.trim() !== '');
            if (addressParts.length > 0) user.address = addressParts.join(', ');
            
            if (companyPhone !== undefined) user.phone = companyPhone;

        } else { // 'particular'
            user.dni = dni;
            user.businessName = name || user.name;
            user.cif = null;

            if (personalStreetAddress !== undefined) user.personalStreetAddress = personalStreetAddress;
            if (personalPostalCode !== undefined) user.personalPostalCode = personalPostalCode;
            if (personalCity !== undefined) user.personalCity = personalCity;
            if (personalProvince !== undefined) user.personalProvince = personalProvince;
            if (personalPhone !== undefined) user.personalPhone = personalPhone;

            // Construir dirección genérica para compatibilidad
            const addressParts = [personalStreetAddress, personalPostalCode, personalCity, personalProvince].filter(part => part && part.trim() !== '');
            if (addressParts.length > 0) user.address = addressParts.join(', ');
            
            if (personalPhone !== undefined) user.phone = personalPhone;
        }

        if (proformaCounter) user.proformaCounter = proformaCounter;
        if (invoiceCounter) user.invoiceCounter = invoiceCounter;

        if (req.files) {
            if (req.files.avatar) {
                const oldAvatarUrl = user.avatarUrl;
                const newAvatarUrl = `/avatars/${req.files.avatar[0].filename}`;
                user.avatarUrl = newAvatarUrl;
                if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
                    const oldAvatarFilename = path.basename(oldAvatarUrl);
                    const oldAvatarFilePath = path.join(__dirname, '..', 'public', 'avatars', oldAvatarFilename);
                    if (fs.existsSync(oldAvatarFilePath)) fs.unlinkSync(oldAvatarFilePath);
                }
            }
            if (req.files.logo) {
                const oldLogoUrl = user.logoUrl;
                const newLogoUrl = `/avatars/${req.files.logo[0].filename}`;
                user.logoUrl = newLogoUrl;
                if (oldLogoUrl && oldLogoUrl !== newLogoUrl) {
                    const oldLogoFilename = path.basename(oldLogoUrl);
                    const oldLogoFilePath = path.join(__dirname, '..', 'public', 'avatars', oldLogoFilename);
                    if (fs.existsSync(oldLogoFilePath)) fs.unlinkSync(oldLogoFilePath);
                }
            }
        }

        await user.save();

        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] }
        });
        const userResponse = updatedUser.toJSON();
        
        if (userResponse.companyId) {
            const company = await Company.findByPk(userResponse.companyId);
            if (company) {
                userResponse.isOwner = userResponse.id === company.ownerId;
            }
        } else {
            userResponse.isOwner = true;
        }

        res.status(200).json(userResponse);

    } catch (error) {
        console.error('Error en updateProfile:', error);
        if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.' });
        if (error.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo se aceptan imágenes.' });
        if (error.message && error.message.includes('Solo se permiten')) return res.status(400).json({ error: error.message });
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
        const userResponse = user.toJSON();
        delete userResponse.password;
        res.status(200).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el avatar.' });
    }
};

// Eliminar el logo del usuario (DELETE /api/auth/logo)
exports.deleteLogo = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        const logoUrlToDelete = user.logoUrl;
        if (logoUrlToDelete) {
            const logoFilename = path.basename(logoUrlToDelete);
            const logoFilePath = path.join(__dirname, '..', 'public', 'avatars', logoFilename);
            if (fs.existsSync(logoFilePath)) {
                fs.unlinkSync(logoFilePath);
            }
        }
        user.logoUrl = null;
        await user.save();
        const userResponse = user.toJSON();
        delete userResponse.password;
        res.status(200).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el logo.' });
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
        const user = req.user;
        if (user.stripeCustomerId) {
            const subscriptions = await stripe.subscriptions.list({ customer: user.stripeCustomerId, status: 'active', limit: 100 });
            for (const subscription of subscriptions.data) {
                await stripe.subscriptions.cancel(subscription.id);
            }
        }
        const ownedCompany = await Company.findOne({ where: { ownerId: userId }, transaction });
        if (ownedCompany) {
            await transaction.rollback();
            return res.status(400).json({ error: `Eres propietario del equipo "${ownedCompany.name}" y no puedes eliminar tu cuenta. Transfiere la propiedad o elimina el equipo primero.` });
        }

        const cars = await Car.findAll({ where: { userId }, transaction });
        
        // Borrado físico de ficheros de los coches
        for (const car of cars) {
            // 1. Imagen principal
            if (car.imageUrl) {
                const imageFilename = path.basename(car.imageUrl);
                const imageFilePath = path.join(__dirname, '..', 'public', 'uploads', imageFilename);
                if (fs.existsSync(imageFilePath)) fs.unlinkSync(imageFilePath);
            }

            // 2. Arrays de documentos (Ficha técnica, Permiso, Otros)
            const docFields = ['technicalSheetUrl', 'registrationCertificateUrl', 'otherDocumentsUrls'];
            docFields.forEach(field => {
                let docs = car[field];
                // Parseo seguro del JSON
                if (typeof docs === 'string') {
                    try { docs = JSON.parse(docs); } catch(e) { docs = []; }
                }
                
                if (Array.isArray(docs)) {
                    docs.forEach(doc => {
                        if (doc && doc.path) {
                            const filename = path.basename(doc.path);
                            const filePath = path.join(__dirname, '..', 'public', 'documents', filename);
                            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        }
                    });
                }
            });

            // 3. PDF de Reserva
            if (car.reservationPdfUrl) {
                 const resFilename = path.basename(car.reservationPdfUrl);
                 const resFilePath = path.join(__dirname, '..', 'public', 'documents', resFilename);
                 if (fs.existsSync(resFilePath)) fs.unlinkSync(resFilePath);
            }
        }

        // Borrado de datos relacionados en BD
        await Incident.destroy({ where: { carId: cars.map(c => c.id) }, transaction });
        await Expense.destroy({ where: { carLicensePlate: cars.map(c => c.licensePlate) }, transaction });
        await Car.destroy({ where: { userId }, transaction });
        await Location.destroy({ where: { userId }, transaction });
        
        // Borrado de avatar de usuario
        if (req.user.avatarUrl) {
            const avatarFilename = path.basename(req.user.avatarUrl);
            const avatarFilePath = path.join(__dirname, '..', 'public', 'avatars', avatarFilename);
            if (fs.existsSync(avatarFilePath)) fs.unlinkSync(avatarFilePath);
        }
        
        // Borrado de logo de usuario
        if (req.user.logoUrl) {
            const logoFilename = path.basename(req.user.logoUrl);
            const logoFilePath = path.join(__dirname, '..', 'public', 'avatars', logoFilename);
            if (fs.existsSync(logoFilePath)) fs.unlinkSync(logoFilePath);
        }

        await User.destroy({ where: { id: userId }, transaction });
        await transaction.commit();
        res.status(200).json({ message: 'Cuenta eliminada permanentemente con éxito.' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al eliminar la cuenta:', error);
        res.status(500).json({ error: 'Error en el servidor al intentar eliminar la cuenta.' });
    }
};