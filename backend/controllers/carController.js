// autogest-app/backend/controllers/carController.js

const fs = require('fs');
const path = require('path');
const { Car, Location, Expense, Incident, sequelize } = require('../models');
const { Op } = require('sequelize');

// Función auxiliar para convertir valores vacíos a null
const emptyToNull = (value) => {
    if (value === '' || value === null || value === undefined) {
        return null;
    }
    return value;
};

// Obtener todos los coches DEL USUARIO LOGUEADO
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(cars);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los coches' });
    }
};

// Obtener un solo coche, ASEGURANDO QUE PERTENECE AL USUARIO
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
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

// Crear un nuevo coche
exports.createCar = async (req, res) => {
    try {
        const carData = { 
            ...req.body, 
            userId: req.user.id
        };

        if (carData.licensePlate) {
            carData.licensePlate = carData.licensePlate.replace(/\s/g, '').toUpperCase();
        }

        if (carData.location && carData.location.trim() !== '') {
            await Location.findOrCreate({
                where: { 
                    name: carData.location.trim(), 
                    userId: req.user.id 
                }
            });
        }

        if (req.files) {
            if (req.files.image) {
                const imageUrl = `/uploads/${req.files.image[0].filename}`;
                carData.imageUrl = imageUrl;
            }
            // --- LÓGICA MODIFICADA PARA MÚLTIPLES DOCUMENTOS ---
            if (req.files.documents && req.files.documents.length > 0) {
                const docUrls = req.files.documents.map(file => `/documents/${file.filename}`);
                carData.documentUrls = docUrls;
            }
        }

        const newCar = await Car.create(carData);
        res.status(201).json(newCar);
    } catch (error) {
        console.error('Error al crear coche:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.fields && error.fields.cars_license_plate) {
                return res.status(400).json({ 
                    error: `Ya existe un coche con la matrícula ${error.fields.cars_license_plate}` 
                });
            }
            if (error.fields && error.fields.cars_vin) {
                return res.status(400).json({ 
                    error: `Ya existe un coche con el VIN ${error.fields.cars_vin}` 
                });
            }
        }
        
        res.status(500).json({ error: 'Error al crear el coche' });
    }
};

// Actualizar un coche existente
exports.updateCar = async (req, res) => {
    try {
        const car = await Car.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!car) {
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para editarlo' });
        }
        
        const updateData = req.body;

        const numericFields = ['price', 'purchasePrice', 'salePrice', 'reservationDeposit', 'km', 'horsepower'];
        numericFields.forEach(field => {
            if (updateData[field] !== undefined) {
                const value = updateData[field];
                const numericValue = parseFloat(String(value).replace(',', '.'));
                updateData[field] = (isNaN(numericValue) || value === null || String(value).trim() === '') ? null : numericValue;
            }
        });
        
        const dateFields = ['registrationDate', 'saleDate'];
        dateFields.forEach(field => {
            if (updateData[field] !== undefined) {
                const dateValue = updateData[field];
                if (!dateValue || isNaN(new Date(dateValue).getTime())) {
                    updateData[field] = null;
                }
            }
        });

        if (updateData.buyerDetails) {
            try {
                updateData.buyerDetails = typeof updateData.buyerDetails === 'string'
                    ? JSON.parse(updateData.buyerDetails)
                    : updateData.buyerDetails;
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
        
        const deleteFile = (fileUrl) => {
            if (!fileUrl) return;
            const filename = path.basename(fileUrl);
            const dir = fileUrl.includes('/uploads/') ? 'uploads' : 'documents';
            const filePath = path.join(__dirname, '..', 'public', dir, filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        };

        // Procesar archivos a eliminar
        if (updateData.filesToRemove) {
            try {
                const filesToRemove = JSON.parse(updateData.filesToRemove);
                if (Array.isArray(filesToRemove) && filesToRemove.length > 0) {
                    // Eliminar archivos del sistema de archivos
                    filesToRemove.forEach(deleteFile);
                    
                    // Actualizar la lista de documentUrls eliminando los archivos especificados
                    if (car.documentUrls && car.documentUrls.length > 0) {
                        updateData.documentUrls = car.documentUrls.filter(url => !filesToRemove.includes(url));
                    }
                }
            } catch (e) {
                console.error('Error parsing filesToRemove:', e);
            }
        }

        if (req.files) {
            if (req.files.image) {
                deleteFile(car.imageUrl);
                updateData.imageUrl = `/uploads/${req.files.image[0].filename}`;
            }
            // --- LÓGICA MODIFICADA PARA MÚLTIPLES DOCUMENTOS ---
            if (req.files.documents && req.files.documents.length > 0) {
                // Si hay documentos existentes y no se especificaron archivos a eliminar, mantenerlos
                const existingDocs = updateData.documentUrls || car.documentUrls || [];
                const newDocs = req.files.documents.map(file => `/documents/${file.filename}`);
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
            
            if (field === 'licensePlate') {
                return res.status(400).json({ 
                    error: `Ya existe un coche con la matrícula ${value}.` 
                });
            } else if (field === 'vin') {
                return res.status(400).json({ 
                    error: `Ya existe un coche con el número de bastidor ${value}.` 
                });
            }
        }
        
        res.status(500).json({ error: 'Error al actualizar el coche' });
    }
};

// Eliminar un coche
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!car) {
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para eliminarlo' });
        }
        
        const deleteFile = (fileUrl) => {
            if (!fileUrl) return;
            const filename = path.basename(fileUrl);
            const dir = fileUrl.includes('/uploads/') ? 'uploads' : 'documents';
            const filePath = path.join(__dirname, '..', 'public', dir, filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        };

        deleteFile(car.imageUrl);
        // --- LÓGICA MODIFICADA PARA MÚLTIPLES DOCUMENTOS ---
        if (car.documentUrls && car.documentUrls.length > 0) {
            car.documentUrls.forEach(deleteFile);
        }

        await car.destroy();
        
        res.status(200).json({ message: 'Coche eliminado correctamente' });

    } catch (error) {
        console.error("Error al eliminar coche:", error);
        res.status(500).json({ error: 'Error al eliminar el coche' });
    }
};