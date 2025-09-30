// autogest-app/backend/controllers/expenseController.js
const { Expense, Car, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Obtener todos los gastos GENERALES (sin coche) del usuario o de su empresa
exports.getAllExpenses = async (req, res) => {
    try {
        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = {
            carLicensePlate: { [Op.is]: null }
        };
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }

        const expenses = await Expense.findAll({
            where: whereClause,
            order: [['date', 'DESC']]
        });
        // --- FIN DE LA MODIFICACIÓN ---
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos generales' });
    }
};

// Obtener TODOS los gastos del usuario (generales + específicos de coches) o de su empresa
exports.getAllUserExpenses = async (req, res) => {
    try {
        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = {};
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }
        
        const expenses = await Expense.findAll({
            where: whereClause,
            order: [['date', 'DESC']]
        });
        // --- FIN DE LA MODIFICACIÓN ---
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener todos los gastos del usuario' });
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

        // --- INICIO DE LA MODIFICACIÓN ---
        if (req.user.companyId) {
            dataToCreate.companyId = req.user.companyId;
        }
        // --- FIN DE LA MODIFICACIÓN ---

        if (carLicensePlate) {
            // --- INICIO DE LA MODIFICACIÓN ---
            const carWhereClause = {
                [Op.and]: [
                    sequelize.where(
                        sequelize.fn('REPLACE', sequelize.col('licensePlate'), ' ', ''),
                        carLicensePlate.replace(/\s/g, '').toUpperCase()
                    )
                ]
            };
            if (req.user.companyId) {
                carWhereClause.companyId = req.user.companyId;
            } else {
                carWhereClause.userId = req.user.id;
            }
            
            const car = await Car.findOne({ where: carWhereClause });
            // --- FIN DE LA MODIFICACIÓN ---
            
            if (!car) {
                return res.status(403).json({ error: 'Permiso denegado. El coche no existe o no pertenece a este usuario/equipo.' });
            }
            
            dataToCreate.carLicensePlate = car.licensePlate;
        } else {
            dataToCreate.carLicensePlate = null;
        }
        
        if (req.files && req.files.length > 0) {
            dataToCreate.attachments = req.files.map(file => `/expenses/${file.filename}`);
        }

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
        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = { id: req.params.id };
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }
        const expense = await Expense.findOne({ where: whereClause });
        // --- FIN DE LA MODIFICACIÓN ---

        if (!expense) {
            return res.status(404).json({ error: 'Gasto no encontrado o no tienes permiso para editarlo.' });
        }
        
        const { date, category, amount, description } = req.body;
        const updateData = { date, category, amount, description };

        if (req.files && req.files.length > 0) {
            const newAttachments = req.files.map(file => `/expenses/${file.filename}`);
            updateData.attachments = newAttachments; 
        }

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
        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = { id: req.params.id };
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }
        const expense = await Expense.findOne({ where: whereClause });
        // --- FIN DE LA MODIFICACIÓN ---

        if (!expense) {
            return res.status(404).json({ error: 'Gasto no encontrado o no tienes permiso para eliminarlo.' });
        }
        
        if (expense.attachments && expense.attachments.length > 0) {
            expense.attachments.forEach(fileUrl => {
                const filename = path.basename(fileUrl);
                const filePath = path.join(__dirname, '..', 'public', 'expenses', filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

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

        // --- INICIO DE LA MODIFICACIÓN ---
        const carWhereClause = {
            [Op.and]: [
                sequelize.where(
                    sequelize.fn('REPLACE', sequelize.col('licensePlate'), ' ', ''),
                    normalizedLicensePlate
                )
            ]
        };
        if (req.user.companyId) {
            carWhereClause.companyId = req.user.companyId;
        } else {
            carWhereClause.userId = req.user.id;
        }

        const car = await Car.findOne({ where: carWhereClause });
        // --- FIN DE LA MODIFICACIÓN ---
        
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