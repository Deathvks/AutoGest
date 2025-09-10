// autogest-app/backend/middleware/fileUploads.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Función para asegurarse de que un directorio exista
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Configuración de almacenamiento genérica
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Guarda las imágenes en 'uploads' y los documentos/PDFs en 'documents'
        let dest;
        if (file.fieldname === 'image') {
            dest = 'public/uploads/';
        } else if (file.fieldname === 'documents' || file.fieldname === 'reservationPdf') {
            dest = 'public/documents/';
        } else {
            dest = 'public/uploads/'; // Default
        }
        ensureDirExists(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de archivos para aceptar imágenes o PDFs
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'image') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('¡El campo de imagen solo acepta archivos de imagen!'), false);
        }
    } else if (file.fieldname === 'documents') {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('¡Los documentos solo pueden ser una imagen o un PDF!'), false);
        }
    } else if (file.fieldname === 'reservationPdf') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('¡El archivo de reserva solo puede ser un PDF!'), false);
        }
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB por archivo
});

// Exportamos el middleware configurado para manejar múltiples campos
module.exports = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'documents', maxCount: 10 },
    { name: 'reservationPdf', maxCount: 1 } // <-- NUEVO CAMPO AÑADIDO
]);