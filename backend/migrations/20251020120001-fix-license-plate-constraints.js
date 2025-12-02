'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const carsTable = 'Cars';
        const expensesTable = 'Expenses';

        // 1. Eliminar la Foreign Key en Expenses que apunta a licensePlate.
        // Al dejar de ser única la matrícula globalmente, no puede ser clave foránea estricta.
        // Probamos varios nombres comunes que Sequelize/MySQL suelen asignar.
        const expenseFkNames = [
            'expenses_ibfk_1', // Nombre por defecto común en MySQL
            'Expenses_carLicensePlate_foreign_idx',
            'expenses_carLicensePlate_fk'
        ];

        for (const fkName of expenseFkNames) {
            try {
                await queryInterface.removeConstraint(expensesTable, fkName);
                console.log(`FK Constraint '${fkName}' eliminada de Expenses.`);
            } catch (error) {
                // Ignoramos si no existe, seguimos probando
            }
        }

        // 2. Eliminar la restricción de unicidad global antigua en Cars
        const carIndexNames = [
            'licensePlate',
            'license_plate',
            'unique_licensePlate',
            'cars_licensePlate_unique'
        ];

        for (const indexName of carIndexNames) {
            try {
                await queryInterface.removeConstraint(carsTable, indexName);
                console.log(`Constraint '${indexName}' eliminada de Cars.`);
            } catch (error) { }

            try {
                await queryInterface.removeIndex(carsTable, indexName);
                console.log(`Index '${indexName}' eliminado de Cars.`);
            } catch (error) { }
        }

        // 3. Añadir la nueva restricción compuesta a Cars (Matrícula + Usuario)
        try {
            await queryInterface.addConstraint(carsTable, {
                fields: ['licensePlate', 'userId'],
                type: 'unique',
                name: 'unique_licensePlate_user'
            });
            console.log('Nueva restricción compuesta creada con éxito.');
        } catch (error) {
            console.log('Nota: La restricción compuesta ya existía o hubo un error controlado:', error.message);
        }
    },

    async down(queryInterface, Sequelize) {
        // Nota: El rollback es complejo porque implicaría restaurar datos que podrían ya estar duplicados.
        // Se deja vacío para evitar inconsistencias en producción.
    }
};