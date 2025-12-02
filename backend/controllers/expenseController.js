// autogest-app/backend/controllers/expenseController.js
const { Expense, Car, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Función para calcular la siguiente fecha de recurrencia
const calculateNextRecurrence = (startDate, type, customValue) => {
    const date = new Date(startDate);
    switch (type) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'custom':
            date.setDate(date.getDate() + parseInt(customValue, 10));
            break;
        default:
            return null;
    }
    return date.toISOString().split('T')[0];
};

// Obtener todos los gastos GENERALES (sin coche) del usuario o de su empresa
exports.getAllExpenses = async (req, res) => {
    try {
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
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos generales' });
    }
};

// Obtener TODOS los gastos del usuario (generales + específicos de coches) o de su empresa
exports.getAllUserExpenses = async (req, res) => {
    try {
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
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener todos los gastos del usuario' });
    }
};

// Crear un nuevo gasto
exports.createExpense = async (req, res) => {
    try {
        const { carLicensePlate, isRecurring, recurrenceType, recurrenceCustomValue, recurrenceEndDate, ...expenseData } = req.body;

        const dataToCreate = {
            ...expenseData,
            userId: req.user.id
        };

        if (req.user.companyId) {
            dataToCreate.companyId = req.user.companyId;
        }

        if (carLicensePlate) {
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

        const isRecurringBool = isRecurring === 'true' || isRecurring === true;
        dataToCreate.isRecurring = isRecurringBool;

        if (isRecurringBool) {
            dataToCreate.recurrenceType = recurrenceType;
            dataToCreate.recurrenceCustomValue = recurrenceType === 'custom' ? recurrenceCustomValue : null;
            dataToCreate.recurrenceEndDate = recurrenceEndDate || null;
            dataToCreate.nextRecurrenceDate = calculateNextRecurrence(dataToCreate.date, recurrenceType, recurrenceCustomValue);
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
        const whereClause = { id: req.params.id };
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }
        const expense = await Expense.findOne({ where: whereClause });

        if (!expense) {
            return res.status(404).json({ error: 'Gasto no encontrado o no tienes permiso para editarlo.' });
        }

        const { date, category, amount, description, isRecurring, recurrenceType, recurrenceCustomValue, recurrenceEndDate } = req.body;
        const updateData = { date, category, amount, description };

        const isRecurringBool = isRecurring === 'true' || isRecurring === true;
        updateData.isRecurring = isRecurringBool;

        if (isRecurringBool) {
            updateData.recurrenceType = recurrenceType;
            updateData.recurrenceCustomValue = recurrenceType === 'custom' ? recurrenceCustomValue : null;
            updateData.recurrenceEndDate = recurrenceEndDate || null;
            updateData.nextRecurrenceDate = calculateNextRecurrence(date, recurrenceType, recurrenceCustomValue);
        } else {
            updateData.recurrenceType = null;
            updateData.recurrenceCustomValue = null;
            updateData.recurrenceEndDate = null;
            updateData.nextRecurrenceDate = null;
        }

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
        const whereClause = { id: req.params.id };
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }
        const expense = await Expense.findOne({ where: whereClause });

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

        if (!car) {
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para ver sus gastos.' });
        }

        // --- INICIO DE LA MODIFICACIÓN ---
        const expensesWhere = { carLicensePlate: car.licensePlate };
        if (req.user.companyId) {
            expensesWhere.companyId = req.user.companyId;
        } else {
            expensesWhere.userId = req.user.id;
        }

        const expenses = await Expense.findAll({
            where: expensesWhere,
            order: [['date', 'DESC']]
        });
        // --- FIN DE LA MODIFICACIÓN ---
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos del coche' });
    }
};