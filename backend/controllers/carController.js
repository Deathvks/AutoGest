const fs = require('fs');
const path = require('path');
const { Car, Location } = require('../models');

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

        // Si se proporciona una ubicación, la busca o la crea.
        if (carData.location && carData.location.trim() !== '') {
            await Location.findOrCreate({
                where: { 
                    name: carData.location.trim(), 
                    userId: req.user.id 
                }
            });
        }

        // req.files es un objeto con los archivos subidos, ej: { image: [file], registrationDocument: [file] }
        if (req.files) {
            if (req.files.image) {
                const imageUrl = `${process.env.BACKEND_URL}/uploads/${req.files.image[0].filename}`;
                carData.imageUrl = imageUrl;
            }
            if (req.files.registrationDocument) {
                const docUrl = `${process.env.BACKEND_URL}/documents/${req.files.registrationDocument[0].filename}`;
                carData.registrationDocumentUrl = docUrl;
            }
        }

        const newCar = await Car.create(carData);
        res.status(201).json(newCar);
    } catch (error) {
        console.error(error);
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
        
        const updateData = { ...req.body };
        
        if (updateData.location && updateData.location.trim() !== '') {
            await Location.findOrCreate({
                where: { name: updateData.location.trim(), userId: req.user.id }
            });
        }
        
        // Función auxiliar para borrar archivos
        const deleteFile = (fileUrl) => {
            if (fileUrl) {
                const filename = path.basename(fileUrl);
                const dir = fileUrl.includes('/uploads/') ? 'uploads' : 'documents';
                const filePath = path.join(__dirname, '..', 'public', dir, filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        };

        if (req.files) {
            if (req.files.image) {
                deleteFile(car.imageUrl); // Borra la imagen antigua
                updateData.imageUrl = `${process.env.BACKEND_URL}/uploads/${req.files.image[0].filename}`;
            }
            if (req.files.registrationDocument) {
                deleteFile(car.registrationDocumentUrl); // Borra el documento antiguo
                updateData.registrationDocumentUrl = `${process.env.BACKEND_URL}/documents/${req.files.registrationDocument[0].filename}`;
            }
        }
        
        await car.update(updateData);
        res.status(200).json(car);

    } catch (error) {
        console.error(error);
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
        
        // Borra la imagen y el documento asociados antes de eliminar el coche
        if (car.imageUrl) {
             const imageFilename = path.basename(car.imageUrl);
             const imageFilePath = path.join(__dirname, '..', 'public', 'uploads', imageFilename);
             if (fs.existsSync(imageFilePath)) fs.unlinkSync(imageFilePath);
        }
        if (car.registrationDocumentUrl) {
             const docFilename = path.basename(car.registrationDocumentUrl);
             const docFilePath = path.join(__dirname, '..', 'public', 'documents', docFilename);
             if (fs.existsSync(docFilePath)) fs.unlinkSync(docFilePath);
        }

        await car.destroy();
        res.status(200).json({ message: 'Coche eliminado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el coche' });
    }
};