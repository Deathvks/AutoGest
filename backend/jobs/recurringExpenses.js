// autogest-app/backend/jobs/recurringExpenses.js
require('dotenv').config();
const cron = require('node-cron');
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
                await Expense.create({
                    date: today,
                    category: recurringExpense.category,
                    amount: recurringExpense.amount,
                    description: recurringExpense.description,
                    carLicensePlate: recurringExpense.carLicensePlate,
                    userId: recurringExpense.userId,
                    companyId: recurringExpense.companyId,
                    attachments: recurringExpense.attachments,
                    isRecurring: false,
                }, { transaction: t });

                const nextDate = calculateNextRecurrence(recurringExpense.nextRecurrenceDate, recurringExpense.recurrenceType, recurringExpense.recurrenceCustomValue);

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

// --- INICIO DE LA MODIFICACIÓN ---
// Nueva función que programa la tarea para que se ejecute una vez al día.
const scheduleRecurringExpenses = () => {
    // Se ejecuta todos los días a las 02:00 AM (zona horaria de Canarias)
    cron.schedule('0 2 * * *', () => {
        console.log('⏰ Ejecutando la tarea programada de gastos recurrentes...');
        processRecurringExpenses();
    }, {
        scheduled: true,
        timezone: "Atlantic/Canary"
    });
    console.log('✅ Tarea de gastos recurrentes programada para ejecutarse a las 02:00 cada día.');
};
// --- FIN DE LA MODIFICACIÓN ---

const runAndExit = async () => {
    await processRecurringExpenses();
    await sequelize.close();
};

if (require.main === module) {
    runAndExit();
}

// --- INICIO DE LA MODIFICACIÓN ---
// Exportamos la función de programación para que index.js pueda llamarla.
module.exports = { scheduleRecurringExpenses };
// --- FIN DE LA MODIFICACIÓN ---