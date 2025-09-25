// autogest-app/backend/utils/carUtils.js
const fs = require('fs');
const path = require('path');

/**
 * Elimina caracteres no válidos de un nombre de fichero.
 * @param {string} name - El nombre del fichero original.
 * @returns {string} El nombre del fichero sanitizado.
 */
const sanitizeFilename = (name) => {
    if (typeof name !== 'string') return '';
    const map = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n', 'ç': 'c',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ñ': 'N', 'Ç': 'C'
    };
    name = name.replace(/[áéíóúñçÁÉÍÓÚÑÇ]/g, char => map[char]);
    return name.replace(/[^a-zA-Z0-9_.\- ]/g, '_');
};

/**
 * Elimina un fichero del sistema de archivos.
 * @param {string|object} fileUrlData - La URL o el objeto de datos del fichero.
 */
const deleteFile = (fileUrlData) => {
    const fileUrl = (typeof fileUrlData === 'object' && fileUrlData !== null) ? fileUrlData.path : fileUrlData;
    if (!fileUrl) return;

    const filename = path.basename(fileUrl);
    let dir = 'uploads';
    if (fileUrl.includes('/documents/')) dir = 'documents';
    else if (fileUrl.includes('/avatars/')) dir = 'avatars';
    else if (fileUrl.includes('/expenses/')) dir = 'expenses';
    
    const filePath = path.join(__dirname, '..', 'public', dir, filename);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error(`Error al eliminar el archivo: ${filePath}`, err);
        }
    }
};

/**
 * Parsea de forma segura una cadena JSON a un array, o devuelve el array si ya está parseado.
 * @param {string|Array} jsonData - La cadena JSON o un array ya parseado.
 * @returns {Array} Un array, vacío si hay un error o la entrada es nula.
 */
const safeJsonParse = (jsonData) => {
    if (!jsonData) return [];
    // --- INICIO DE LA MODIFICACIÓN ---
    // Si ya es un array, lo devolvemos directamente.
    if (Array.isArray(jsonData)) return jsonData; 
    // --- FIN DE LA MODIFICACIÓN ---
    try {
        const parsed = JSON.parse(jsonData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        // Si el parseo falla, es posible que sea una cadena simple que no es JSON.
        return [];
    }
};

module.exports = {
    sanitizeFilename,
    deleteFile,
    safeJsonParse,
};