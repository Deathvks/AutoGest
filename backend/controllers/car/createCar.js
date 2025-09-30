// autogest-app/backend/controllers/car/createCar.js
const { Car, Location } = require('../../models');
const { sanitizeFilename } = require('../../utils/carUtils');

/**
 * Crea un nuevo coche en la base de datos.
 * Asocia ficheros subidos y gestiona la creación de nuevas ubicaciones.
 */
exports.createCar = async (req, res) => {
    try {
        const carData = { ...req.body, userId: req.user.id };

        // --- INICIO DE LA MODIFICACIÓN ---
        // Si el usuario pertenece a una empresa, se asocia el coche y la ubicación a ella.
        if (req.user.companyId) {
            carData.companyId = req.user.companyId;
        }
        // --- FIN DE LA MODIFICACIÓN ---

        // Si el usuario no es admin/técnico, no se le permite establecer un precio de compra.
        if (req.user.role === 'user') {
            delete carData.purchasePrice;
        }

        // Normaliza la matrícula a mayúsculas y sin espacios.
        if (carData.licensePlate) {
            carData.licensePlate = carData.licensePlate.replace(/\s/g, '').toUpperCase();
        }

        // Si se proporciona una nueva ubicación, se crea si no existe.
        if (carData.location && carData.location.trim() !== '') {
            // --- INICIO DE LA MODIFICACIÓN ---
            const locationData = {
                where: { name: carData.location.trim(), userId: req.user.id },
                defaults: {}
            };
            if (req.user.companyId) {
                locationData.where.companyId = req.user.companyId;
            }
            await Location.findOrCreate(locationData);
            // --- FIN DE LA MODIFICACIÓN ---
        }
        
        // Asocia los ficheros subidos solo si existen.
        if (req.files) {
            if (req.files.image) {
                carData.imageUrl = `/uploads/${req.files.image[0].filename}`;
            }
            const fileFields = ['technicalSheet', 'registrationCertificate', 'otherDocuments'];
            fileFields.forEach(field => {
                if (req.files[field] && req.files[field].length > 0) {
                    const urlField = field === 'otherDocuments' ? 'otherDocumentsUrls' : `${field}Url`;
                    carData[urlField] = req.files[field].map(file => ({
                        path: `/documents/${file.filename}`,
                        originalname: sanitizeFilename(file.originalname)
                    }));
                }
            });
        }

        const newCar = await Car.create(carData);
        res.status(201).json(newCar);
    } catch (error) {
        console.error('Error al crear coche:', error);
        if (error.message && error.message.includes('¡Los documentos solo pueden ser una imagen o un PDF!')) {
            return res.status(400).json({ error: '¡Error! Los documentos solo pueden ser imágenes (JPG, PNG, WEBP) o archivos PDF.' });
        }
        // Manejo de errores específicos, como matrículas o VIN duplicados.
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0]?.path;
            const value = error.errors[0]?.value;
            return res.status(400).json({ error: `Ya existe un coche con ${field === 'licensePlate' ? 'la matrícula' : 'el VIN'} ${value}` });
        }
        res.status(500).json({ error: 'Error al crear el coche' });
    }
};