// backend/fix-indices.js
require('dotenv').config();
const { sequelize } = require('./models');

const fixIndices = async () => {
    console.log("🔍 Iniciando inspección de índices en la tabla 'Cars'...");

    try {
        // Obtenemos todos los índices de la tabla Cars directamente de MySQL
        const [results] = await sequelize.query("SHOW INDEX FROM Cars");

        // Agrupamos por nombre de índice
        const indexes = {};
        results.forEach(row => {
            if (!indexes[row.Key_name]) indexes[row.Key_name] = [];
            indexes[row.Key_name].push(row.Column_name);
        });

        console.log("📋 Índices encontrados:", Object.keys(indexes));

        let deletedCount = 0;

        // Buscamos índices que solo afecten a 'licensePlate' y sean únicos
        for (const [keyName, columns] of Object.entries(indexes)) {
            // Saltamos la PRIMARY KEY y el índice compuesto correcto que acabamos de crear
            if (keyName === 'PRIMARY') continue;
            if (keyName === 'unique_licensePlate_user') {
                console.log(`✅ Índice correcto detectado: ${keyName} (Matrícula + Usuario). Se conserva.`);
                continue;
            }

            // Si el índice afecta a 'licensePlate' (o 'license_plate') y NO incluye 'userId'
            if ((columns.includes('licensePlate') || columns.includes('license_plate')) && !columns.includes('userId')) {

                // Verificamos si es único (Non_unique === 0)
                const indexInfo = results.find(r => r.Key_name === keyName);
                if (indexInfo && indexInfo.Non_unique === 0) {
                    console.log(`⚠️ Encontrado índice conflictivo: '${keyName}'. Impide duplicar matrículas globalmente.`);
                    console.log(`🗑️ Eliminando índice '${keyName}'...`);

                    await sequelize.query(`ALTER TABLE Cars DROP INDEX ${keyName}`);
                    console.log(`✅ Índice '${keyName}' eliminado con éxito.`);
                    deletedCount++;
                }
            }
        }

        if (deletedCount === 0) {
            console.log("👍 No se encontraron índices conflictivos adicionales.");
        } else {
            console.log(`🎉 Se eliminaron ${deletedCount} restricciones antiguas. Ahora deberías poder repetir matrículas entre usuarios.`);
        }

    } catch (error) {
        console.error("❌ Error durante la inspección:", error);
    } finally {
        await sequelize.close();
    }
};

fixIndices();