// backend/middleware/imageConversion.js
const { processImageToWebp } = require('../utils/imageProcessor');
const path = require('path');

/**
 * Middleware para convertir imágenes subidas a WebP automáticamente.
 * Se debe ejecutar DESPUÉS de Multer y ANTES del controlador.
 * Soporta req.file (un archivo) y req.files (múltiples, array u objeto).
 */
const convertImagesToWebp = async (req, res, next) => {
    // Si no hay archivos subidos, pasamos al siguiente middleware
    if (!req.file && !req.files) {
        return next();
    }

    try {
        // 1. Caso: Un solo archivo (req.file)
        if (req.file) {
            if (req.file.mimetype.startsWith('image/')) {
                const newPath = await processImageToWebp(req.file.path);
                
                // Actualizamos la información del archivo en el objeto request
                // para que el controlador use el nuevo archivo .webp
                req.file.path = newPath;
                req.file.filename = path.basename(newPath);
                req.file.mimetype = 'image/webp';
            }
        }

        // 2. Caso: Múltiples archivos (req.files)
        if (req.files) {
            // req.files puede ser un array (upload.array) o un objeto con arrays (upload.fields)
            const fileArrays = Array.isArray(req.files) 
                ? [req.files] 
                : Object.values(req.files);

            for (const files of fileArrays) {
                for (const file of files) {
                    // Solo procesamos si es una imagen
                     if (file.mimetype.startsWith('image/')) {
                        const newPath = await processImageToWebp(file.path);
                        
                        // Actualizamos la información
                        file.path = newPath;
                        file.filename = path.basename(newPath);
                        file.mimetype = 'image/webp';
                    }
                }
            }
        }

        next();
    } catch (error) {
        console.error('[ImageConversion Middleware] Error al convertir imágenes:', error);
        // Si falla la conversión, no bloqueamos la petición; 
        // el controlador usará la imagen original.
        next(); 
    }
};

module.exports = convertImagesToWebp;