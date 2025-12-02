'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableName = 'Cars';

        // 1. Eliminar la restricción de unicidad global existente.
        // Sequelize suele nombrar la constraint igual que la columna cuando se usa unique: true.
        try {
            await queryInterface.removeConstraint(tableName, 'licensePlate');
        } catch (error) {
            console.warn('Advertencia: No se pudo eliminar la constraint "licensePlate". Intentando eliminar índice...');
            // Fallback por si acaso es solo un índice o tiene otro nombre
            try {
                await queryInterface.removeIndex(tableName, 'licensePlate');
            } catch (err) {
                console.warn('Nota: Si la migración falla aquí, verifica el nombre exacto del índice "unique" en tu base de datos para la columna licensePlate.');
                // Si no existe, seguimos, quizás ya se borró manualmente.
            }
        }

        // 2. Añadir la nueva restricción compuesta (Matrícula + Usuario)
        await queryInterface.addConstraint(tableName, {
            fields: ['licensePlate', 'userId'],
            type: 'unique',
            name: 'unique_licensePlate_user'
        });
    },

    async down(queryInterface, Sequelize) {
        const tableName = 'Cars';

        // 1. Eliminar la restricción compuesta
        await queryInterface.removeConstraint(tableName, 'unique_licensePlate_user');

        // 2. Restaurar la unicidad global
        // Nota: Esto fallará si ya existen datos duplicados en la BD al hacer rollback.
        await queryInterface.addConstraint(tableName, {
            fields: ['licensePlate'],
            type: 'unique',
            name: 'licensePlate'
        });
    }
};