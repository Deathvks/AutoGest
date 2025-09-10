// autogest-app/backend/controllers/dashboardController.js
const { Car, Expense } = require('../models');
const { Op } = require('sequelize');

// --- OBTENER ESTADÍSTICAS FILTRADAS POR FECHA ---
exports.getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        // --- INICIO DE LA MODIFICACIÓN ---
        // Se crean objetos de filtro base para cada consulta
        const carPurchaseFilter = { userId };
        const expenseFilter = { userId };
        const carSaleFilter = { userId, status: 'Vendido' };

        // Se ajusta la fecha final para que incluya el día completo
        const endOfDay = endDate ? new Date(endDate) : null;
        if (endOfDay) {
            endOfDay.setHours(23, 59, 59, 999);
        }
        
        // Se aplica la lógica de fechas a cada filtro
        if (startDate && endDate) {
            carPurchaseFilter.createdAt = { [Op.between]: [new Date(startDate), endOfDay] };
            expenseFilter.date = { [Op.between]: [new Date(startDate), endOfDay] };
            carSaleFilter.saleDate = { [Op.between]: [new Date(startDate), endOfDay] };
        } else if (startDate) {
            // Desde la fecha de inicio hasta ahora
            carPurchaseFilter.createdAt = { [Op.gte]: new Date(startDate) };
            expenseFilter.date = { [Op.gte]: new Date(startDate) };
            carSaleFilter.saleDate = { [Op.gte]: new Date(startDate) };
        } else if (endDate) {
            // Desde el principio hasta la fecha de fin
            carPurchaseFilter.createdAt = { [Op.lte]: endOfDay };
            expenseFilter.date = { [Op.lte]: endOfDay };
            carSaleFilter.saleDate = { [Op.lte]: endOfDay };
        }
        // --- FIN DE LA MODIFICACIÓN ---

        // --- Consultas a la base de datos con los filtros actualizados ---
        const totalPurchasePriceAllCars = await Car.sum('purchasePrice', { where: carPurchaseFilter });
        const totalExpenses = await Expense.sum('amount', { where: expenseFilter });
        const totalRevenue = await Car.sum('salePrice', { where: carSaleFilter });
        const purchasePriceOfSoldCars = await Car.sum('purchasePrice', { where: carSaleFilter });

        // --- Cálculos ---
        const totalInvestment = (totalPurchasePriceAllCars || 0) + (totalExpenses || 0);
        const totalProfit = (totalRevenue || 0) - ((purchasePriceOfSoldCars || 0) + (totalExpenses || 0));

        res.status(200).json({
            totalInvestment,
            totalRevenue: totalRevenue || 0,
            totalExpenses: totalExpenses || 0,
            totalProfit,
        });

    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({ error: 'Error al obtener las estadísticas' });
    }
};


// --- OBTENER HISTORIAL DE ACTIVIDAD PAGINADO ---
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
            // Evento de Creación
            activities.push({
                type: 'creacion',
                description: `Se añadió el coche ${car.make} ${car.model}`,
                date: car.createdAt,
                carId: car.id,
            });

            // Evento de Venta
            if (car.status === 'Vendido' && car.saleDate) {
                activities.push({
                    type: 'venta',
                    description: `Se vendió el coche ${car.make} ${car.model}`,
                    date: car.saleDate,
                    carId: car.id,
                });
            }

            // Evento de Reserva (usamos updatedAt porque es cuando cambia el estado)
            if (car.status === 'Reservado' && car.reservationExpiry) {
                 activities.push({
                    type: 'reserva',
                    description: `Se reservó el coche ${car.make} ${car.model}`,
                    date: car.updatedAt, // La reserva actualiza el coche
                    carId: car.id,
                });
            }
        });
        
        // Ordenar todas las actividades por fecha descendente
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Paginación
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