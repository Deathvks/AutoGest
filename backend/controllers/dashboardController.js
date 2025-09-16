// autogest-app/backend/controllers/dashboardController.js
const { Car, Expense, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- INICIO DE LA MODIFICACIÓN ---
// Función auxiliar para asegurar que el resultado de SUM sea un número válido.
const normalizeSum = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};
// --- FIN DE LA MODIFICACIÓN ---

exports.getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.id;
        const isMonthlyView = !!(startDate || endDate);

        let totalInvestment = 0;
        let totalExpenses = 0;
        const dateFilter = {};

        if (isMonthlyView) {
            const endOfDay = endDate ? new Date(endDate) : new Date();
            if (endDate) endOfDay.setHours(23, 59, 59, 999);
            
            if (startDate && endDate) {
                dateFilter[Op.between] = [new Date(startDate), endOfDay];
            } else if (startDate) {
                dateFilter[Op.gte] = new Date(startDate);
            } else {
                dateFilter[Op.lte] = endOfDay;
            }
        }

        if (isMonthlyView) {
            const purchasePriceInPeriod = await Car.sum('purchasePrice', { where: { userId, createdAt: dateFilter } });
            totalExpenses = await Expense.sum('amount', { where: { userId, date: dateFilter } });
            const costOfSoldCarsInPeriod = await Car.sum('purchasePrice', { where: { userId, status: 'Vendido', saleDate: dateFilter } });

            totalInvestment = normalizeSum(purchasePriceInPeriod) + normalizeSum(totalExpenses) - normalizeSum(costOfSoldCarsInPeriod);
        } else {
            const totalPurchasePriceOfStock = await Car.sum('purchasePrice', { where: { userId, status: { [Op.not]: 'Vendido' } } });
            totalExpenses = await Expense.sum('amount', { where: { userId } });
            
            totalInvestment = normalizeSum(totalPurchasePriceOfStock) + normalizeSum(totalExpenses);
        }

        const totalRevenueSum = await Car.sum('salePrice', { where: { userId, status: 'Vendido', ...(isMonthlyView ? { saleDate: dateFilter } : {}) } });
        const potentialRevenueSum = await Car.sum('price', {
            where: {
                userId,
                status: {
                    [Op.not]: 'Vendido'
                }
            }
        });

        // --- INICIO DE LA MODIFICACIÓN ---
        // Aplicamos la normalización a todos los resultados de SUM
        const totalRevenue = normalizeSum(totalRevenueSum);
        const potentialRevenue = normalizeSum(potentialRevenueSum);
        totalExpenses = normalizeSum(totalExpenses);
        // --- FIN DE LA MODIFICACIÓN ---

        let totalProfit = 0;
        const soldCars = await Car.findAll({
            where: { userId, status: 'Vendido', salePrice: { [Op.gt]: 0 }, ...(isMonthlyView ? { saleDate: dateFilter } : {}) }
        });

        if (soldCars.length > 0) {
            const soldCarsExpenses = await Expense.findAll({
                where: {
                    userId,
                    carLicensePlate: { [Op.in]: soldCars.map(c => c.licensePlate) }
                }
            });

            totalProfit = soldCars.reduce((profitSum, car) => {
                const expensesForThisCar = soldCarsExpenses
                    .filter(exp => exp.carLicensePlate === car.licensePlate)
                    .reduce((expSum, exp) => expSum + (exp.amount || 0), 0);
                
                const carProfit = (car.salePrice || 0) - (car.purchasePrice || 0) - expensesForThisCar;
                return profitSum + carProfit;
            }, 0);
        }

        res.status(200).json({
            totalInvestment,
            totalRevenue,
            totalExpenses,
            totalProfit,
            potentialRevenue,
        });

    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({ error: 'Error al obtener las estadísticas' });
    }
};

exports.getActivityHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const cars = await Car.findAll({
            where: { userId },
            attributes: ['id', 'make', 'model', 'licensePlate', 'status', 'createdAt', 'updatedAt', 'saleDate', 'reservationExpiry'],
            order: [['updatedAt', 'DESC']],
        });

        let activities = [];

        cars.forEach(car => {
            activities.push({
                type: 'creacion',
                description: `Se añadió el coche ${car.make} ${car.model}`,
                date: car.createdAt,
                carId: car.id,
            });

            if (car.status === 'Vendido' && car.saleDate) {
                activities.push({
                    type: 'venta',
                    description: `Se vendió el coche ${car.make} ${car.model}`,
                    date: car.saleDate,
                    carId: car.id,
                });
            }

            if (car.status === 'Reservado' && car.reservationExpiry) {
                 activities.push({
                    type: 'reserva',
                    description: `Se reservó el coche ${car.make} ${car.model}`,
                    date: car.updatedAt,
                    carId: car.id,
                });
            }
        });

        const expenses = await Expense.findAll({
            where: { userId },
            order: [['date', 'DESC']],
        });

        expenses.forEach(expense => {
            const car = expense.carLicensePlate ? cars.find(c => c.licensePlate === expense.carLicensePlate) : null;
            let description = '';
            
            if (car) {
                description = `Nuevo gasto de ${expense.category} en ${car.make} ${car.model}`;
            } else {
                description = `Nuevo gasto general de ${expense.category}`;
            }

            activities.push({
                type: 'gasto',
                description: description,
                date: expense.createdAt,
                carId: car ? car.id : null,
            });
        });
        
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        const paginatedActivities = activities.slice(offset, offset + limit);
        const totalPages = Math.ceil(activities.length / limit);

        res.status(200).json({
            activities: paginatedActivities,
            totalPages,
            currentPage: page,
        });

    } catch (error) {
        console.error('Error al obtener el historial de actividad:', error);
        res.status(500).json({ error: 'Error al obtener el historial' });
    }
};