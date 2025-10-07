// autogest-app/backend/jobs/recurringExpenses.js
require('dotenv').config();
const { Expense } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

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

const processRecurringExpenses = async () => {
    console.log('Iniciando proceso de gastos recurrentes...');
    const today = new Date().toISOString().split('T')[0];

    try {
        const recurringExpenses = await Expense.findAll({
            where: {
                isRecurring: true,
                nextRecurrenceDate: {
                    [Op.lte]: today,
                },
            },
        });

        console.log(`Se encontraron ${recurringExpenses.length} gastos recurrentes para procesar.`);

        for (const recurringExpense of recurringExpenses) {
            const t = await sequelize.transaction();
            try {
                // 1. Crea la nueva instancia del gasto
                await Expense.create({
                    date: today,
                    category: recurringExpense.category,
                    amount: recurringExpense.amount,
                    description: recurringExpense.description,
                    carLicensePlate: recurringExpense.carLicensePlate,
                    userId: recurringExpense.userId,
                    companyId: recurringExpense.companyId,
                    attachments: recurringExpense.attachments,
                    isRecurring: false, // El gasto generado no es recurrente
                }, { transaction: t });

                // 2. Calcula la siguiente fecha para el gasto original
                const nextDate = calculateNextRecurrence(recurringExpense.nextRecurrenceDate, recurringExpense.recurrenceType, recurringExpense.recurrenceCustomValue);

                // 3. Comprueba si la recurrencia debe terminar
                if (recurringExpense.recurrenceEndDate && new Date(nextDate) > new Date(recurringExpense.recurrenceEndDate)) {
                    recurringExpense.isRecurring = false;
                    recurringExpense.nextRecurrenceDate = null;
                } else {
                    recurringExpense.nextRecurrenceDate = nextDate;
                }

                await recurringExpense.save({ transaction: t });
                
                await t.commit();
                console.log(` -> Gasto recurrente ID ${recurringExpense.id} procesado. Siguiente fecha: ${recurringExpense.nextRecurrenceDate}`);
            } catch (error) {
                await t.rollback();
                console.error(`Error procesando el gasto recurrente ID ${recurringExpense.id}:`, error);
            }
        }
    } catch (error) {
        console.error('Error al obtener gastos recurrentes:', error);
    }
};

const runAndExit = async () => {
    await processRecurringExpenses();
    await sequelize.close();
};

// Permite ejecutar el script directamente desde la terminal
if (require.main === module) {
    runAndExit();
}

// Exporta la función principal para poder llamarla desde otros ficheros
module.exports = { processRecurringExpenses };