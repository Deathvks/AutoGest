const multer = require('multer');
const path = require('path');

// 1. Configuración de almacenamiento
const storage = multer.diskStorage({
    // Define la carpeta donde se guardarán las imágenes
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    // Define el nombre del archivo para evitar nombres duplicados
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Filtro de archivos para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
        return cb(null, true);
    }
    cb('Error: ¡Solo se permiten archivos de imagen!');
};

// 3. Creación del middleware de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por archivo
});

// Exportamos el middleware configurado para un solo archivo llamado 'image'
module.exports = upload.single('image');