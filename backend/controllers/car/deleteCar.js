// autogest-app/backend/controllers/car/deleteCar.js
const { Car, Expense, Incident, sequelize } = require('../../models');
const { deleteFile, safeJsonParse } = require('../../utils/carUtils');

/**
 * Elimina un coche y todos sus datos asociados de forma permanente.
 * Esto incluye imágenes, documentos, gastos e incidencias.
 */
exports.deleteCar = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const car = await Car.findOne({ 
            where: { id: req.params.id, userId: req.user.id },
            transaction 
        });

        if (!car) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para eliminarlo' });
        }
        
        // Elimina los ficheros asociados al coche.
        deleteFile(car.imageUrl);
        deleteFile(car.reservationPdfUrl);
        
        const documentFields = ['technicalSheetUrl', 'registrationCertificateUrl', 'otherDocumentsUrls'];
        documentFields.forEach(field => {
            const docs = safeJsonParse(car[field]);
            docs.forEach(doc => deleteFile(doc.path)); // Se corrige para usar doc.path
        });

        // Elimina los registros asociados en otras tablas.
        await Incident.destroy({ where: { carId: car.id }, transaction });
        await Expense.destroy({ where: { carLicensePlate: car.licensePlate }, transaction });
        
        // Finalmente, elimina el coche.
        await car.destroy({ transaction });
        
        await transaction.commit();
        
        res.status(200).json({ message: 'Coche eliminado correctamente' });

    } catch (error) {
        await transaction.rollback();
        console.error("Error al eliminar coche:", error);
        res.status(500).json({ error: 'Error al eliminar el coche' });
    }
};