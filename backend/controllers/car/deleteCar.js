// autogest-app/backend/controllers/car/deleteCar.js
const { Car, Expense, Incident, sequelize } = require('../../models');
const { deleteFile, safeJsonParse } = require('../../utils/carUtils');

/**
 * Elimina un coche y todos sus datos asociados de forma permanente.
 * Esto incluye imágenes, documentos, gastos e incidencias.
 */
exports.deleteCar = async (req, res) => {
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se elimina la transacción, ya que el borrado en cascada lo simplifica.
    try {
        const whereClause = { id: req.params.id };
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }

        const car = await Car.findOne({ where: whereClause });

        if (!car) {
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para eliminarlo' });
        }
        
        // Elimina los ficheros asociados al coche.
        deleteFile(car.imageUrl);
        deleteFile(car.reservationPdfUrl);
        
        const documentFields = ['technicalSheetUrl', 'registrationCertificateUrl', 'otherDocumentsUrls'];
        documentFields.forEach(field => {
            const docs = safeJsonParse(car[field]);
            docs.forEach(doc => deleteFile(doc.path));
        });

        // Elimina el coche de la base de datos.
        // Gracias a 'onDelete: CASCADE' en los modelos, los gastos e incidencias
        // asociados se eliminarán automáticamente.
        await car.destroy();
        
        res.status(200).json({ message: 'Coche eliminado correctamente' });

    } catch (error) {
        console.error("Error al eliminar coche:", error);
        res.status(500).json({ error: 'Error al eliminar el coche' });
    }
    // --- FIN DE LA MODIFICACIÓN ---
};