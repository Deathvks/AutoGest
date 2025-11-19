// backend/utils/imageProcessor.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Convierte una imagen a formato WebP y elimina el archivo original.
 * @param {string} filePath - Ruta completa del archivo a procesar.
 * @returns {Promise<string>} - Ruta del nuevo archivo WebP procesado.
 */
const processImageToWebp = async (filePath) => {
    try {
        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) return filePath;

        const ext = path.extname(filePath).toLowerCase();
        
        // Si ya es WebP, no es necesario convertir (podríamos optimizar, pero lo dejamos así por simplicidad)
        if (ext === '.webp') return filePath;

        const dir = path.dirname(filePath);
        const name = path.basename(filePath, ext);
        const newFilePath = path.join(dir, `${name}.webp`);

        // Procesar la imagen con Sharp
        await sharp(filePath)
            .webp({ quality: 80 }) // Calidad 80% ofrece buen balance calidad/peso
            .toFile(newFilePath);

        // Eliminar el archivo original antiguo
        fs.unlinkSync(filePath);

        return newFilePath;
    } catch (error) {
        console.error(`[ImageProcessor] Error al convertir ${filePath}:`, error.message);
        // En caso de error, devolvemos la ruta original para no romper el flujo
        return filePath;
    }
};

module.exports = { processImageToWebp };