// autogest-app/backend/jobs/subscriptionReminders.js
require('dotenv').config();
const cron = require('node-cron');
const { User, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

const checkSubscriptionStatuses = async () => {
    console.log('Iniciando revisión de estado de suscripciones...');
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    try {
        // 1. Usuarios con suscripciones activas a punto de renovar
        const usersToRenew = await User.findAll({
            where: {
                subscriptionStatus: 'active',
                subscriptionExpiry: {
                    [Op.lte]: threeDaysFromNow, // La fecha de expiración es en 3 días o menos
                    [Op.gte]: today            // Y todavía no ha pasado
                }
            }
        });

        console.log(`Se encontraron ${usersToRenew.length} suscripciones prontas a renovar.`);
        for (const user of usersToRenew) {
            const daysRemaining = Math.ceil((new Date(user.subscriptionExpiry) - today) / (1000 * 60 * 60 * 24));
            await Notification.findOrCreate({
                where: {
                    userId: user.id,
                    type: 'subscription',
                    message: { [Op.like]: '%Tu suscripción se renovará pronto%' }
                },
                defaults: {
                    userId: user.id,
                    message: `Tu suscripción se renovará pronto. El próximo cobro se realizará aproximadamente en ${daysRemaining} día(s).`,
                    type: 'subscription',
                }
            });
        }

        // 2. Usuarios con suscripciones canceladas a punto de expirar
        const usersToCancel = await User.findAll({
            where: {
                subscriptionStatus: 'cancelled',
                subscriptionExpiry: {
                    [Op.lte]: threeDaysFromNow,
                    [Op.gte]: today
                }
            }
        });

        console.log(`Se encontraron ${usersToCancel.length} suscripciones prontas a expirar.`);
        for (const user of usersToCancel) {
            const daysRemaining = Math.ceil((new Date(user.subscriptionExpiry) - today) / (1000 * 60 * 60 * 24));
             await Notification.findOrCreate({
                where: {
                    userId: user.id,
                    type: 'subscription',
                    message: { [Op.like]: '%Tu acceso premium finalizará en%' }
                },
                defaults: {
                    userId: user.id,
                    message: `Tu acceso premium finalizará en ${daysRemaining} día(s).`,
                    type: 'subscription',
                }
            });
        }

    } catch (error) {
        console.error('Error al revisar el estado de las suscripciones:', error);
    }
};

const scheduleSubscriptionReminders = () => {
    // Se ejecuta todos los días a las 10:00 AM (zona horaria de Canarias)
    cron.schedule('0 10 * * *', () => {
        console.log('⏰ Ejecutando la tarea programada de recordatorios de suscripción...');
        checkSubscriptionStatuses();
    }, {
        scheduled: true,
        timezone: "Atlantic/Canary"
    });
    console.log('✅ Tarea de recordatorios de suscripción programada para ejecutarse a las 10:00 cada día.');
};

module.exports = { scheduleSubscriptionReminders };