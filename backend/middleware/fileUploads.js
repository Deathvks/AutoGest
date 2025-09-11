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
        } else if ([
            'technicalSheet', 
            'registrationCertificate', 
            'otherDocuments', 
            'reservationPdf'
        ].includes(file.fieldname)) {
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
    const allowedImageTypes = /jpeg|jpg|png|webp/;
    const allowedDocumentTypes = /jpeg|jpg|png|webp|pdf/;

    if (file.fieldname === 'image') {
        if (allowedImageTypes.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('¡El campo de imagen solo acepta archivos de imagen!'), false);
        }
    } else if ([
        'technicalSheet', 
        'registrationCertificate', 
        'otherDocuments'
    ].includes(file.fieldname)) {
        if (allowedDocumentTypes.test(file.mimetype)) {
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
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB por archivo
});

// --- INICIO DE LA MODIFICACIÓN ---
// Se actualiza el maxCount de otherDocuments a 6
module.exports = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'technicalSheet', maxCount: 2 },
    { name: 'registrationCertificate', maxCount: 2 },
    { name: 'otherDocuments', maxCount: 6 }, // <-- LÍNEA CORREGIDA
    { name: 'reservationPdf', maxCount: 1 }
]);
// --- FIN DE LA MODIFICACIÓN ---