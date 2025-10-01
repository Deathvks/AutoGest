// autogest-app/backend/migrate.js
const { sequelize } = require('./models');

const runMigration = async () => {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();

    console.log('Iniciando migración manual...');

    try {
        if (tables.includes('Cars')) {
            const carsDescription = await queryInterface.describeTable('Cars');

            // --- INICIO DE LA MODIFICACIÓN ---
            // Se elimina la lógica que añadía la columna 'deletedAt'.
            // --- FIN DE LA MODIFICACIÓN ---

            if (!carsDescription.saleDate) {
                console.log('-> Añadiendo columna "saleDate" a Cars...');
                await queryInterface.addColumn('Cars', 'saleDate', { type: sequelize.Sequelize.DATEONLY, allowNull: true });
                console.log('✅ Columna "saleDate" añadida.');
            }

            if (!carsDescription.buyerDetails) {
                console.log('-> Añadiendo columna "buyerDetails" a Cars...');
                await queryInterface.addColumn('Cars', 'buyerDetails', { type: sequelize.Sequelize.JSON, allowNull: true });
                console.log('✅ Columna "buyerDetails" añadida.');
            }
            
            if (!carsDescription.documentUrls && carsDescription.registrationDocumentUrl) {
                console.log('-> Renombrando "registrationDocumentUrl" a "documentUrls" en Cars...');
                await queryInterface.renameColumn('Cars', 'registrationDocumentUrl', 'documentUrls');
                await queryInterface.changeColumn('Cars', 'documentUrls', { type: sequelize.Sequelize.JSON, allowNull: true });
                console.log('✅ Columna renombrada y tipo cambiado a JSON.');
            } else if (!carsDescription.documentUrls) {
                console.log('-> Añadiendo columna "documentUrls" a Cars...');
                 await queryInterface.addColumn('Cars', 'documentUrls', { type: sequelize.Sequelize.JSON, allowNull: true });
                 console.log('✅ Columna "documentUrls" añadida.');
            }
            
            if (!carsDescription.reservationExpiry) {
                console.log('-> Añadiendo columna "reservationExpiry" a Cars...');
                await queryInterface.addColumn('Cars', 'reservationExpiry', {
                    type: sequelize.Sequelize.DATE,
                    allowNull: true,
                });
                console.log('✅ Columna "reservationExpiry" añadida.');
            }

            if (!carsDescription.reservationPdfUrl) {
                console.log('-> Añadiendo columna "reservationPdfUrl" a Cars...');
                await queryInterface.addColumn('Cars', 'reservationPdfUrl', {
                    type: sequelize.Sequelize.STRING,
                    allowNull: true,
                });
                console.log('✅ Columna "reservationPdfUrl" añadida.');
            }
        }
        
        console.log('\n🎉 Migración completada con éxito.');

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
    } finally {
        await sequelize.close();
    }
};

runMigration();