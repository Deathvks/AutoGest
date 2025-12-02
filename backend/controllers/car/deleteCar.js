// autogest-app/backend/controllers/car/deleteCar.js
const { Car, Expense, Incident, sequelize } = require('../../models');
const { deleteFile, safeJsonParse } = require('../../utils/carUtils');

/**
 * Elimina un coche y todos sus datos asociados de forma permanente.
 * Esto incluye imágenes, documentos, gastos e incidencias.
 */
exports.deleteCar = async (req, res) => {
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

        // 1. Elimina los ficheros asociados al coche.
        deleteFile(car.imageUrl);
        deleteFile(car.reservationPdfUrl);

        const documentFields = ['technicalSheetUrl', 'registrationCertificateUrl', 'otherDocumentsUrls'];
        documentFields.forEach(field => {
            const docs = safeJsonParse(car[field]);
            docs.forEach(doc => deleteFile(doc.path));
        });

        // --- INICIO DE LA MODIFICACIÓN ---
        // 2. Elimina manualmente los gastos asociados.
        // Como la matrícula ya no es única globalmente, no hay ON DELETE CASCADE en BD para los gastos.
        if (car.licensePlate) {
            const expenseWhere = { carLicensePlate: car.licensePlate };

            // Filtramos estrictamente por el propietario del coche para no borrar gastos de otros usuarios con la misma matrícula
            if (car.companyId) {
                expenseWhere.companyId = car.companyId;
            } else {
                expenseWhere.userId = car.userId;
            }

            // Recuperamos los gastos primero para borrar sus ficheros adjuntos
            const expenses = await Expense.findAll({ where: expenseWhere });
            for (const expense of expenses) {
                if (expense.attachments) {
                    const attachments = safeJsonParse(expense.attachments);
                    attachments.forEach(fileUrl => deleteFile(fileUrl));
                }
            }

            // Borramos los registros de gastos
            await Expense.destroy({ where: expenseWhere });
        }
        // --- FIN DE LA MODIFICACIÓN ---

        // 3. Elimina el coche de la base de datos.
        // Las incidencias (Incidents) sí se borran automáticamente porque van ligadas por ID (Cascade).
        await car.destroy();

        res.status(200).json({ message: 'Coche eliminado correctamente' });

    } catch (error) {
        console.error("Error al eliminar coche:", error);
        res.status(500).json({ error: 'Error al eliminar el coche' });
    }
};