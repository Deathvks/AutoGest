// autogest-app/backend/controllers/carController.js

const fs = require('fs');
const path = require('path');
const { Car, Location, Expense, Incident, sequelize } = require('../models');
const { Op } = require('sequelize');

const sanitizeFilename = (name) => {
    if (typeof name !== 'string') return '';
    const map = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n', 'ç': 'c',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ñ': 'N', 'Ç': 'C'
    };
    name = name.replace(/[áéíóúñçÁÉÍÓÚÑÇ]/g, char => map[char]);
    return name.replace(/[^a-zA-Z0-9_.\- ]/g, '_');
};

const deleteFile = (fileUrl) => {
    if (!fileUrl) return;
    const filename = path.basename(fileUrl);
    let dir = 'uploads';
    if (fileUrl.includes('/documents/')) dir = 'documents';
    else if (fileUrl.includes('/avatars/')) dir = 'avatars';
    else if (fileUrl.includes('/expenses/')) dir = 'expenses';
    
    const filePath = path.join(__dirname, '..', 'public', dir, filename);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error(`Error al eliminar el archivo: ${filePath}`, err);
        }
    }
};

exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        const now = new Date();
        const promises = cars.map(car => {
            if (car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) < now) {
                if (car.reservationPdfUrl) {
                    deleteFile(car.reservationPdfUrl);
                    car.reservationPdfUrl = null;
                }
                car.status = 'En venta';
                car.reservationDeposit = null;
                car.reservationExpiry = null;
                return car.save();
            }
            return Promise.resolve();
        });

        await Promise.all(promises);

        res.status(200).json(cars);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los coches' });
    }
};

exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (car) {
            res.status(200).json(car);
        } else {
            res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para verlo' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el coche' });
    }
};

exports.createCar = async (req, res) => {
    try {
        const carData = { ...req.body, userId: req.user.id };

        if (carData.licensePlate) {
            carData.licensePlate = carData.licensePlate.replace(/\s/g, '').toUpperCase();
        }

        if (carData.location && carData.location.trim() !== '') {
            await Location.findOrCreate({
                where: { name: carData.location.trim(), userId: req.user.id }
            });
        }

        if (req.files) {
            if (req.files.image) {
                carData.imageUrl = `/uploads/${req.files.image[0].filename}`;
            }
            if (req.files.documents && req.files.documents.length > 0) {
                carData.documentUrls = req.files.documents.map(file => ({
                    path: `/documents/${file.filename}`,
                    originalname: sanitizeFilename(file.originalname)
                }));
            }
        }

        const newCar = await Car.create(carData);
        res.status(201).json(newCar);
    } catch (error) {
        console.error('Error al crear coche:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0]?.path;
            const value = error.errors[0]?.value;
            return res.status(400).json({ error: `Ya existe un coche con ${field === 'licensePlate' ? 'la matrícula' : 'el VIN'} ${value}` });
        }
        res.status(500).json({ error: 'Error al crear el coche' });
    }
};

exports.updateCar = async (req, res) => {
    try {
        const car = await Car.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!car) {
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para editarlo' });
        }
        
        const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
        const isUserTryingToModifyLockedCar = isReservedAndActive && req.user.role !== 'admin';

        if (isUserTryingToModifyLockedCar) {
            const isCancellingReservation = req.body.status && req.body.status !== 'Reservado';
            if (!isCancellingReservation) {
                return res.status(403).json({ error: 'Este coche está reservado y no se puede modificar.' });
            }
        }

        const updateData = req.body;

        if (updateData.status === 'Reservado' && updateData.reservationDuration) {
            const durationInHours = parseInt(updateData.reservationDuration, 10);
            if (!isNaN(durationInHours) && durationInHours > 0) {
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + durationInHours);
                updateData.reservationExpiry = expiryDate;
            }
            delete updateData.reservationDuration;

            if (req.files && req.files.reservationPdf) {
                deleteFile(car.reservationPdfUrl);
                updateData.reservationPdfUrl = `/documents/${req.files.reservationPdf[0].filename}`;
            }
        } else if (updateData.status === 'En venta') {
            deleteFile(car.reservationPdfUrl);
            updateData.reservationPdfUrl = null;
            updateData.reservationDeposit = null;
            updateData.reservationExpiry = null;
        }

        const numericFields = ['price', 'purchasePrice', 'salePrice', 'reservationDeposit', 'km', 'horsepower'];
        numericFields.forEach(field => {
            if (updateData[field] !== undefined) {
                const value = updateData[field];
                const numericValue = parseFloat(String(value).replace(',', '.'));
                updateData[field] = (isNaN(numericValue) || value === null || String(value).trim() === '') ? null : numericValue;
            }
        });
        
        const dateFields = ['registrationDate', 'saleDate', 'gestoriaPickupDate', 'gestoriaReturnDate'];
        dateFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateData[field] = (!updateData[field] || isNaN(new Date(updateData[field]).getTime())) ? null : updateData[field];
            }
        });
        
        const optionalTextFields = ['fuel', 'transmission', 'vin', 'location', 'notes'];
        optionalTextFields.forEach(field => {
            if (updateData[field] !== undefined && String(updateData[field]).trim() === '') {
                updateData[field] = null;
            }
        });

        if (updateData.buyerDetails) {
            try {
                updateData.buyerDetails = typeof updateData.buyerDetails === 'string' ? JSON.parse(updateData.buyerDetails) : updateData.buyerDetails;
            } catch (e) {
                return res.status(400).json({ error: 'Los detalles del comprador no tienen un formato JSON válido.' });
            }
        }
        
        if (updateData.licensePlate) {
            updateData.licensePlate = String(updateData.licensePlate).replace(/\s/g, '').toUpperCase();
        }
        
        if (updateData.location && String(updateData.location).trim() !== '') {
            await Location.findOrCreate({
                where: { name: String(updateData.location).trim(), userId: req.user.id }
            });
        }
        
        let currentDocumentUrls = [];
        if (car.documentUrls) {
            if (typeof car.documentUrls === 'string') {
                try {
                    const parsed = JSON.parse(car.documentUrls);
                    if (Array.isArray(parsed)) {
                        currentDocumentUrls = parsed;
                    }
                } catch (e) {
                    console.error(`[LOG] Error al parsear documentUrls para el coche ID ${car.id}:`, e);
                }
            } else if (Array.isArray(car.documentUrls)) {
                currentDocumentUrls = car.documentUrls;
            }
        }

        if (updateData.filesToRemove) {
            try {
                const filesToRemovePaths = JSON.parse(updateData.filesToRemove);
                if (Array.isArray(filesToRemovePaths)) {
                    filesToRemovePaths.forEach(deleteFile);
                    updateData.documentUrls = currentDocumentUrls.filter(doc => !filesToRemovePaths.includes(doc.path));
                }
            } catch (e) { 
                console.error(`[LOG] Error al procesar filesToRemove para el coche ID ${car.id}:`, e);
            }
        }

        if (req.files) {
            if (req.files.image) {
                deleteFile(car.imageUrl);
                updateData.imageUrl = `/uploads/${req.files.image[0].filename}`;
            }
            if (req.files.documents && req.files.documents.length > 0) {
                const existingDocs = updateData.documentUrls || currentDocumentUrls;
                const newDocs = req.files.documents.map(file => ({
                    path: `/documents/${file.filename}`,
                    originalname: sanitizeFilename(file.originalname)
                }));
                updateData.documentUrls = [...existingDocs, ...newDocs];
            }
        }
        
        await car.update(updateData);
        res.status(200).json(car);
    } catch (error) {
        console.error(`[ERROR] Fallo en updateCar para el coche ID: ${req.params.id}. Error:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0]?.path;
            const value = error.errors[0]?.value;
            return res.status(400).json({ error: `Ya existe un coche con ${field === 'licensePlate' ? 'la matrícula' : 'el VIN'} ${value}.` });
        }
        res.status(500).json({ error: 'Error al actualizar el coche' });
    }
};

exports.deleteCar = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const car = await Car.findOne({ 
            where: { id: req.params.id, userId: req.user.id },
            transaction 
        });

        if (!car) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para eliminarlo' });
        }
        
        // 1. Borrar archivos físicos
        deleteFile(car.imageUrl);
        deleteFile(car.reservationPdfUrl);
        
        let documentUrlsArray = [];
        if (car.documentUrls && typeof car.documentUrls === 'string') {
            try {
                const parsed = JSON.parse(car.documentUrls);
                if (Array.isArray(parsed)) documentUrlsArray = parsed;
            } catch (e) {
                console.error("Error al parsear documentUrls al eliminar:", e);
            }
        } else if (Array.isArray(car.documentUrls)) {
            documentUrlsArray = car.documentUrls;
        }

        if (documentUrlsArray.length > 0) {
            documentUrlsArray.forEach(doc => deleteFile(doc.path));
        }

        // 2. Borrar registros asociados manualmente
        await Expense.destroy({ where: { carLicensePlate: car.licensePlate }, transaction });
        await Incident.destroy({ where: { carId: car.id }, transaction });
        
        // 3. Borrar el coche
        await car.destroy({ transaction });
        
        // 4. Confirmar la transacción
        await transaction.commit();
        
        res.status(200).json({ message: 'Coche eliminado correctamente' });

    } catch (error) {
        // Si algo falla, revertir todo
        await transaction.rollback();
        console.error("Error al eliminar coche:", error);
        res.status(500).json({ error: 'Error al eliminar el coche' });
    }
};