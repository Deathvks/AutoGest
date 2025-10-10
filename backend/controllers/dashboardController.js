// autogest-app/backend/controllers/dashboardController.js
const { Car, Expense, sequelize } = require('../models');
const { Op } = require('sequelize');

const normalizeSum = (value) => {
    if (value === null || value === undefined) {
        return 0;
    }
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

exports.getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userScope = req.user.companyId ? { companyId: req.user.companyId } : { userId: req.user.id };
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
        
        const allUserCars = await Car.findAll({ where: userScope });
        const allUserExpenses = await Expense.findAll({ where: userScope });
        
        const carsInPeriod = isMonthlyView ? allUserCars.filter(c => {
            const createdAt = new Date(c.createdAt);
            return createdAt >= new Date(startDate) && createdAt <= new Date(endDate);
        }) : allUserCars;

        const expensesInPeriod = isMonthlyView ? allUserExpenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
        }) : allUserExpenses;

        const soldCarsInPeriod = allUserCars.filter(c => {
            if (c.status !== 'Vendido') return false;
            if (!isMonthlyView) return true;
            const saleDate = new Date(c.saleDate);
            return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        });
        
        totalExpenses = expensesInPeriod.reduce((sum, exp) => sum + normalizeSum(exp.amount), 0);
        const totalRevenue = soldCarsInPeriod.reduce((sum, car) => sum + normalizeSum(car.salePrice), 0);
        
        const carsInStock = allUserCars.filter(car => car.status !== 'Vendido');
        const potentialRevenue = carsInStock.reduce((sum, car) => sum + normalizeSum(car.price), 0);
        
        if (isMonthlyView) {
            const purchasePriceInPeriod = carsInPeriod.reduce((sum, car) => sum + normalizeSum(car.purchasePrice), 0);
            const costOfSoldCarsInPeriod = soldCarsInPeriod.reduce((sum, car) => sum + normalizeSum(car.purchasePrice), 0);
            totalInvestment = purchasePriceInPeriod + totalExpenses - costOfSoldCarsInPeriod;
        } else {
            const totalPurchasePriceOfStock = carsInStock.reduce((sum, car) => sum + normalizeSum(car.purchasePrice), 0);
            totalInvestment = totalPurchasePriceOfStock + totalExpenses;
        }
        
        let totalProfit = 0;
        if (soldCarsInPeriod.length > 0) {
            totalProfit = soldCarsInPeriod.reduce((profitSum, car) => {
                const expensesForThisCar = allUserExpenses
                    .filter(exp => exp.carLicensePlate === car.licensePlate)
                    .reduce((expSum, exp) => expSum + normalizeSum(exp.amount), 0);
                
                const carProfit = normalizeSum(car.salePrice) - normalizeSum(car.purchasePrice) - expensesForThisCar;
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
        const userScope = req.user.companyId ? { companyId: req.user.companyId } : { userId: req.user.id };
        const page = parseInt(req.query.page, 10) || 1;
        const typeFilter = req.query.type || ''; // <-- Se obtiene el filtro
        const limit = 10;
        const offset = (page - 1) * limit;

        const cars = await Car.findAll({
            where: userScope,
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
            where: userScope,
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
        
        // --- INICIO DE LA MODIFICACIÓN ---
        // Se filtra el array de actividades si se ha proporcionado un 'typeFilter'
        let filteredActivities = activities;
        if (typeFilter) {
            filteredActivities = activities.filter(activity => activity.type === typeFilter);
        }
        
        // Se ordena por fecha DESPUÉS de haber filtrado
        filteredActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

        const paginatedActivities = filteredActivities.slice(offset, offset + limit);
        const totalPages = Math.ceil(filteredActivities.length / limit);
        // --- FIN DE LA MODIFICACIÓN ---

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