// autogest-app/backend/middleware/expenseUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storageDir = 'public/expenses/';

// Asegurarse de que el directorio de almacenamiento exista
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storageDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Acepta imágenes y PDFs
    const allowedTypes = /jpeg|jpg|png|webp|pdf/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
        return cb(null, true);
    }
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes y PDFs.'));
};

// Se usa .array() para permitir múltiples archivos bajo el campo 'attachments'
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB por archivo
});

module.exports = upload.array('attachments', 10); // Acepta hasta 10 archivos