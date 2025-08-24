const { Expense, Car } = require('../models');

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

        // Ahora es obligatorio que se asocie a un coche
        if (!carLicensePlate) {
            return res.status(400).json({ error: 'La matrícula del coche es obligatoria.' });
        }

        const car = await Car.findOne({ where: { licensePlate: carLicensePlate, userId: req.user.id } });
        if (!car) {
            return res.status(403).json({ error: 'Permiso denegado. El coche no existe o no pertenece a este usuario.' });
        }

        const newExpense = await Expense.create({ carLicensePlate, ...expenseData });
        res.status(201).json(newExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el gasto' });
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

        const car = await Car.findOne({ where: { licensePlate, userId: req.user.id } });
        if (!car) {
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para ver sus gastos.' });
        }

        const expenses = await Expense.findAll({
            where: { carLicensePlate: licensePlate },
            order: [['date', 'DESC']]
        });
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos del coche' });
    }
};