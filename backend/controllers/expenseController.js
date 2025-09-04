// autogest-app/backend/controllers/expenseController.js
const { Expense, Car, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Obtener todos los gastos GENERALES (sin coche) del usuario
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: { 
                userId: req.user.id,
                carLicensePlate: { [Op.is]: null }
            },
            order: [['date', 'DESC']]
        });
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos generales' });
    }
};

// Crear un nuevo gasto
exports.createExpense = async (req, res) => {
    try {
        const { carLicensePlate, ...expenseData } = req.body;
        
        const dataToCreate = {
            ...expenseData,
            userId: req.user.id
        };

        if (carLicensePlate) {
            const normalizedLicensePlate = carLicensePlate.replace(/\s/g, '').toUpperCase();
            const car = await Car.findOne({
                where: {
                    [Op.and]: [
                        sequelize.where(
                            sequelize.fn('REPLACE', sequelize.col('licensePlate'), ' ', ''),
                            normalizedLicensePlate
                        ),
                        { userId: req.user.id }
                    ]
                }
            });
            
            if (!car) {
                return res.status(403).json({ error: 'Permiso denegado. El coche no existe o no pertenece a este usuario.' });
            }
            
            dataToCreate.carLicensePlate = car.licensePlate;
        } else {
            dataToCreate.carLicensePlate = null;
        }
        
        // --- NUEVA LÓGICA PARA ARCHIVOS ---
        if (req.files && req.files.length > 0) {
            dataToCreate.attachments = req.files.map(file => `/expenses/${file.filename}`);
        }
        // --- FIN ---

        const newExpense = await Expense.create(dataToCreate);
        res.status(201).json(newExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el gasto' });
    }
};

// Actualizar un gasto
exports.updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!expense) {
            return res.status(404).json({ error: 'Gasto no encontrado o no tienes permiso para editarlo.' });
        }
        
        const { date, category, amount, description } = req.body;
        const updateData = { date, category, amount, description };

        // --- NUEVA LÓGICA PARA ARCHIVOS ---
        if (req.files && req.files.length > 0) {
            const newAttachments = req.files.map(file => `/expenses/${file.filename}`);
            // Aquí podrías combinar con los antiguos si quisieras, pero por ahora reemplazamos
            updateData.attachments = newAttachments; 
        }
        // --- FIN ---

        await expense.update(updateData);

        res.status(200).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el gasto.' });
    }
};

// Eliminar un gasto
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!expense) {
            return res.status(404).json({ error: 'Gasto no encontrado o no tienes permiso para eliminarlo.' });
        }
        
        // --- NUEVA LÓGICA PARA BORRAR ARCHIVOS ---
        if (expense.attachments && expense.attachments.length > 0) {
            expense.attachments.forEach(fileUrl => {
                const filename = path.basename(fileUrl);
                const filePath = path.join(__dirname, '..', 'public', 'expenses', filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        // --- FIN ---

        await expense.destroy();
        res.status(200).json({ message: 'Gasto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el gasto' });
    }
};

// Obtener gastos por matrícula
exports.getExpensesByCarLicensePlate = async (req, res) => {
    try {
        const { licensePlate } = req.params;
        const normalizedLicensePlate = licensePlate.replace(/\s/g, '').toUpperCase();

        const car = await Car.findOne({
            where: {
                [Op.and]: [
                    sequelize.where(
                        sequelize.fn('REPLACE', sequelize.col('licensePlate'), ' ', ''),
                        normalizedLicensePlate
                    ),
                    { userId: req.user.id }
                ]
            }
        });
        
        if (!car) {
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para ver sus gastos.' });
        }

        const expenses = await Expense.findAll({
            where: { carLicensePlate: car.licensePlate },
            order: [['date', 'DESC']]
        });
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos del coche' });
    }
};