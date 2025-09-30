// autogest-app/backend/controllers/car/updateCar.js
const { Car, Location } = require('../../models');
const { sanitizeFilename, deleteFile, safeJsonParse } = require('../../utils/carUtils');

/**
 * Actualiza la información de un coche existente.
 * Maneja la lógica de reservas, ficheros y normalización de datos.
 */
exports.updateCar = async (req, res) => {
    try {
        // --- INICIO DE LA MODIFICACIÓN ---
        const whereClause = { id: req.params.id };
        if (req.user.companyId) {
            whereClause.companyId = req.user.companyId;
        } else {
            whereClause.userId = req.user.id;
        }
        const car = await Car.findOne({ where: whereClause });
        // --- FIN DE LA MODIFICACIÓN ---

        if (!car) {
            return res.status(404).json({ error: 'Coche no encontrado o no tienes permiso para editarlo.' });
        }
        
        const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
        const isUserTryingToModifyLockedCar = isReservedAndActive && user.role !== 'admin';

        if (isUserTryingToModifyLockedCar) {
            const isCancellingReservation = req.body.status && req.body.status !== 'Reservado';
            if (!isCancellingReservation) {
                return res.status(403).json({ error: 'Este coche está reservado y no se puede modificar.' });
            }
        }

        const updateData = req.body;
        
        if (req.user.role === 'user') {
            delete updateData.purchasePrice;
        }

        if (updateData.status === 'Reservado' && updateData.reservationDuration) {
            const durationInHours = parseInt(updateData.reservationDuration, 10);
            if (!isNaN(durationInHours) && durationInHours > 0) {
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + durationInHours);
                updateData.reservationExpiry = expiryDate;
            }
            delete updateData.reservationDuration;

            if (req.files && req.files.reservationPdf) {
                deleteFile(car.reservationPdfUrl);
                updateData.reservationPdfUrl = `/documents/${req.files.reservationPdf[0].filename}`;
            }
        } else if (updateData.status === 'En venta') {
            deleteFile(car.reservationPdfUrl);
            updateData.reservationPdfUrl = null;
            updateData.reservationDeposit = null;
            updateData.reservationExpiry = null;
            updateData.salePrice = null;
            updateData.saleDate = null;
            updateData.buyerDetails = null;
        }

        const numericFields = ['price', 'purchasePrice', 'salePrice', 'reservationDeposit', 'km', 'horsepower', 'keys'];
        numericFields.forEach(field => {
            if (updateData[field] !== undefined) {
                const value = updateData[field];
                const numericValue = parseFloat(String(value).replace(',', '.'));
                updateData[field] = (isNaN(numericValue) || value === null || String(value).trim() === '') ? null : numericValue;
            }
        });
        
        const dateFields = ['registrationDate', 'saleDate', 'gestoriaPickupDate', 'gestoriaReturnDate'];
        dateFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateData[field] = (!updateData[field] || isNaN(new Date(updateData[field]).getTime())) ? null : updateData[field];
            }
        });
        
        const optionalTextFields = ['fuel', 'transmission', 'vin', 'location', 'notes'];
        optionalTextFields.forEach(field => {
            if (updateData[field] !== undefined && String(updateData[field]).trim() === '') {
                updateData[field] = null;
            }
        });
        
        if (updateData.buyerDetails) {
            try {
                updateData.buyerDetails = typeof updateData.buyerDetails === 'string' 
                    ? JSON.parse(updateData.buyerDetails) 
                    : updateData.buyerDetails;
            } catch (e) {
                return res.status(400).json({ error: 'Los detalles del comprador no tienen un formato JSON válido.' });
            }
        }
        
        if (updateData.licensePlate) {
            updateData.licensePlate = String(updateData.licensePlate).replace(/\s/g, '').toUpperCase();
        }
        
        if (updateData.location && String(updateData.location).trim() !== '') {
            await Location.findOrCreate({
                where: { name: String(updateData.location).trim(), userId: req.user.id }
            });
        }
        
        if (req.files) {
            if (req.files.invoicePdf) {
                if (!req.files.otherDocuments) req.files.otherDocuments = [];
                req.files.otherDocuments.push(...req.files.invoicePdf);
            }

            if (req.files.image) {
                deleteFile(car.imageUrl);
                updateData.imageUrl = `/uploads/${req.files.image[0].filename}`;
            }
            
            const fileFields = ['technicalSheet', 'registrationCertificate', 'otherDocuments'];
            const MAX_FILES = {
                technicalSheet: 2,
                registrationCertificate: 2,
                otherDocuments: 6,
            };

            fileFields.forEach(field => {
                const urlField = field === 'otherDocuments' ? 'otherDocumentsUrls' : `${field}Url`;
                let currentDocs = safeJsonParse(car[urlField]);

                if (updateData.filesToRemove) {
                    const filesToRemove = safeJsonParse(updateData.filesToRemove);
                    const removalsForThisField = filesToRemove.filter(f => f.type === field);
                    if (removalsForThisField.length > 0) {
                        const pathsToRemove = removalsForThisField.map(f => f.path);
                        currentDocs = currentDocs.filter(doc => !pathsToRemove.includes(doc.path));
                    }
                }

                if (req.files[field] && req.files[field].length > 0) {
                    const newDocs = req.files[field].map(file => ({
                        path: `/documents/${file.filename}`,
                        originalname: sanitizeFilename(file.originalname)
                    }));
                    currentDocs.push(...newDocs);
                }

                const limit = MAX_FILES[field];
                if (currentDocs.length > limit) {
                    const discardedCount = currentDocs.length - limit;
                    const discardedDocs = currentDocs.slice(0, discardedCount);
                    discardedDocs.forEach(doc => deleteFile(doc));
                    currentDocs = currentDocs.slice(discardedCount);
                }
                
                updateData[urlField] = JSON.stringify(currentDocs);
            });
        }
        delete updateData.filesToRemove;
        
        await car.update(updateData);
        res.status(200).json(car);
    } catch (error) {
        console.error(`[ERROR] Fallo en updateCar para el coche ID: ${req.params.id}. Error:`, error);
        if (error.message && error.message.includes('¡Los documentos solo pueden ser una imagen o un PDF!')) {
            return res.status(400).json({ error: '¡Error! Los documentos solo pueden ser imágenes (JPG, PNG, WEBP) o archivos PDF.' });
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0]?.path;
            const value = error.errors[0]?.value;
            return res.status(400).json({ error: `Ya existe un coche con ${field === 'licensePlate' ? 'la matrícula' : 'el VIN'} ${value}.` });
        }
        res.status(500).json({ error: 'Error al actualizar el coche' });
    }
};