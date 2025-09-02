// autogest-app/backend/controllers/expenseController.js
const { Expense, Car, sequelize } = require('../models'); // Importamos sequelize
const { Op } = require('sequelize'); // Importamos los operadores

// Obtener todos los gastos de los coches del usuario
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            include: [{
                model: Car,
                where: { userId: req.user.id },
                attributes: []
            }],
            order: [['date', 'DESC']]
        });
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos' });
    }
};

// Crear un nuevo gasto, verificando la matrícula y la propiedad del coche
exports.createExpense = async (req, res) => {
    try {
        const { carLicensePlate, ...expenseData } = req.body;

        if (!carLicensePlate) {
            return res.status(400).json({ error: 'La matrícula del coche es obligatoria.' });
        }
        
        const normalizedLicensePlate = carLicensePlate.replace(/\s/g, '').toUpperCase();

        // Buscamos el coche comparando las matrículas sin espacios
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
        
        // Guardamos el gasto usando la matrícula original del coche encontrado para mantener consistencia
        const newExpense = await Expense.create({ carLicensePlate: car.licensePlate, ...expenseData });
        res.status(201).json(newExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el gasto' });
    }
};

// --- FUNCIÓN NUEVA ---
// Actualizar un gasto existente
exports.updateExpense = async (req, res) => {
    try {
        const { carLicensePlate, ...updateData } = req.body;

        // 1. Encontrar el gasto y asegurarse de que pertenece al usuario
        const expense = await Expense.findByPk(req.params.id, {
            include: [{
                model: Car,
                where: { userId: req.user.id }
            }]
        });

        if (!expense) {
            return res.status(404).json({ error: 'Gasto no encontrado o no tienes permiso para editarlo.' });
        }

        // 2. Si se cambia la matrícula, verificar que el nuevo coche también pertenece al usuario
        if (carLicensePlate && carLicensePlate !== expense.carLicensePlate) {
            const normalizedLicensePlate = carLicensePlate.replace(/\s/g, '').toUpperCase();
            const newCar = await Car.findOne({
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

            if (!newCar) {
                return res.status(403).json({ error: 'Permiso denegado. El nuevo coche no existe o no pertenece a este usuario.' });
            }
            // Usar la matrícula original del nuevo coche
            updateData.carLicensePlate = newCar.licensePlate;
        }

        // 3. Actualizar el gasto con los nuevos datos
        await expense.update(updateData);
        res.status(200).json(expense);

    } catch (error) {
        console.error('Error al actualizar el gasto:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el gasto.' });
    }
};

// Eliminar un gasto, verificando que pertenece a un coche del usuario
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id, {
            include: [{
                model: Car,
                where: { userId: req.user.id }
            }]
        });

        if (!expense) {
            return res.status(404).json({ error: 'Gasto no encontrado o no tienes permiso para eliminarlo.' });
        }

        await expense.destroy();
        res.status(200).json({ message: 'Gasto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el gasto' });
    }
};

// Obtener gastos por matrícula, verificando la propiedad del coche
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