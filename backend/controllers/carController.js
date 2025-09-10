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
        
        // --- INICIO DE LA CORRECCIÓN ---
        // Asegurarse de que `car.documentUrls` sea un array antes de usarlo.
        let currentDocumentUrls = [];
        if (typeof car.documentUrls === 'string') {
            try {
                currentDocumentUrls = JSON.parse(car.documentUrls);
            } catch (e) {
                console.error('Error al parsear documentUrls:', e);
                // Si hay un error, se trata como si no hubiera documentos.
            }
        } else if (Array.isArray(car.documentUrls)) {
            currentDocumentUrls = car.documentUrls;
        }

        if (updateData.filesToRemove) {
            try {
                const filesToRemovePaths = JSON.parse(updateData.filesToRemove);
                if (Array.isArray(filesToRemovePaths)) {
                    filesToRemovePaths.forEach(deleteFile);
                    // Usar la variable parseada y asegurada
                    updateData.documentUrls = currentDocumentUrls.filter(doc => !filesToRemovePaths.includes(doc.path));
                }
            } catch (e) { console.error('Error parsing filesToRemove:', e); }
        }
        // --- FIN DE LA CORRECCIÓN ---

        if (req.files) {
            if (req.files.image) {
                deleteFile(car.imageUrl);
                updateData.imageUrl = `/uploads/${req.files.image[0].filename}`;
            }
            if (req.files.documents && req.files.documents.length > 0) {
                // Usar la variable `updateData.documentUrls` si ya fue modificada, si no, la original parseada
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
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0]?.path;
            const value = error.errors[0]?.value;
            return res.status(400).json({ error: `Ya existe un coche con ${field === 'licensePlate' ? 'la matrícula' : 'el VIN'} ${value}.` });
        }
        res.status(500).json({ error: 'Error al actualizar el coche' });
    }
};

exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!car) {
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para eliminarlo' });
        }
        
        deleteFile(car.imageUrl);
        deleteFile(car.reservationPdfUrl);
        if (car.documentUrls && car.documentUrls.length > 0) {
            car.documentUrls.forEach(doc => deleteFile(doc.path));
        }

        await car.destroy();
        
        res.status(200).json({ message: 'Coche eliminado correctamente' });

    } catch (error) {
        console.error("Error al eliminar coche:", error);
        res.status(500).json({ error: 'Error al eliminar el coche' });
    }
};