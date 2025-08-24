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
        // Guarda las imágenes en 'uploads' y los documentos en 'documents'
        const dest = file.fieldname === 'image' ? 'public/uploads/' : 'public/documents/';
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
    } else if (file.fieldname === 'registrationDocument') {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('¡El permiso solo puede ser una imagen o un PDF!'), false);
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
// 'image' puede tener 1 archivo, 'registrationDocument' puede tener 1 archivo.
module.exports = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'registrationDocument', maxCount: 1 }
]);