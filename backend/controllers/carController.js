// autogest-app/backend/controllers/carController.js

const fs = require('fs');
const path = require('path');
const { Car, Location, sequelize } = require('../models');
const { Op } = require('sequelize');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
        
        const {
            make, model, price, purchasePrice, salePrice, reservationDeposit, status,
            location, km, fuel, horsepower, registrationDate, licensePlate, vin,
            transmission, notes, tags
        } = req.body;

        const updateData = {
            make, model, transmission, notes, tags, fuel, status, location,
            registrationDate, licensePlate, vin,
            price: emptyToNull(price),
            purchasePrice: emptyToNull(purchasePrice),
            salePrice: emptyToNull(salePrice),
            reservationDeposit: emptyToNull(reservationDeposit),
            km: emptyToNull(km),
            horsepower: emptyToNull(horsepower),
        };

        if (updateData.licensePlate) {
            updateData.licensePlate = updateData.licensePlate.replace(/\s/g, '').toUpperCase();
        }
        
        if (updateData.location && updateData.location.trim() !== '') {
            await Location.findOrCreate({
                where: { name: updateData.location.trim(), userId: req.user.id }
            });
        }
        
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
                deleteFile(car.imageUrl);
                updateData.imageUrl = `${process.env.BACKEND_URL}/uploads/${req.files.image[0].filename}`;
            }
            if (req.files.registrationDocument) {
                deleteFile(car.registrationDocumentUrl);
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

// Analizar un documento con IA
exports.analyzeDocument = async (req, res) => {
    try {
        const { image } = req.body; 

        if (!image) {
            return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen.' });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: `Analiza la imagen de esta ficha técnica de vehículo y extrae los siguientes datos en un objeto JSON: "make" (marca), "model" (modelo), "licensePlate" (matrícula), "vin" (número de bastidor), "potenciaFiscal" (potencia fiscal o CVF, como un número con decimales si los tiene), y "registrationDate" (fecha de matriculación en formato YYYY-MM-DD). Si un campo no se encuentra, su valor debe ser null. Responde únicamente con el objeto JSON, sin texto adicional.`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                "url": image,
                            },
                        },
                    ],
                },
            ],
        });

        const result = response.choices[0].message.content;
        const cleanedJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanedJson);

        // --- NUEVA LÓGICA DE CÁLCULO ---
        if (parsedData.potenciaFiscal) {
            const cvf = parseFloat(String(parsedData.potenciaFiscal).replace(',', '.'));
            if (!isNaN(cvf)) {
                parsedData.horsepower = Math.round(cvf * 1.36);
            }
        }

        res.status(200).json(parsedData);

    } catch (error) {
        console.error('Error en el análisis de OpenAI:', error);
        res.status(500).json({ error: 'Error al procesar la imagen con la IA.' });
    }
};