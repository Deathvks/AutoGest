// autogest-app/backend/clear-locations.js
// --- INICIO DE LA MODIFICACIÓN ---
require('dotenv').config();
// --- FIN DE LA MODIFICACIÓN ---
const { Location, Car } = require('./models');

const clearLocations = async () => {
    console.log('Iniciando limpieza de ubicaciones...');
    try {
        // Primero, desvinculamos las ubicaciones de todos los coches existentes.
        // Buscamos todas las ubicaciones para obtener sus nombres.
        const locations = await Location.findAll({ attributes: ['name'] });
        const locationNames = locations.map(loc => loc.name);

        if (locationNames.length > 0) {
            console.log(`Desvinculando ${locationNames.length} ubicaciones de los coches...`);
            // Actualizamos los coches que tengan estas ubicaciones para poner su campo 'location' a null.
            await Car.update({ location: null }, {
                where: {
                    location: locationNames
                }
            });
            console.log('✅ Ubicaciones desvinculadas de los coches.');
        } else {
            console.log('No hay ubicaciones que desvincular.');
        }

        // Ahora, borramos todas las entradas de la tabla 'Locations'.
        const deletedRows = await Location.destroy({
            where: {},
            truncate: false // 'truncate' es más rápido pero no funciona si hay restricciones, 'destroy' es más seguro.
        });
        console.log(`✅ Se han eliminado ${deletedRows} ubicaciones.`);
        console.log('🎉 Limpieza de ubicaciones completada con éxito.');

    } catch (error) {
        console.error('❌ Error durante la limpieza de ubicaciones:', error);
    } finally {
        // Importante cerrar la conexión a la base de datos para que el script finalice.
        const { sequelize } = require('./models');
        await sequelize.close();
    }
};

clearLocations();