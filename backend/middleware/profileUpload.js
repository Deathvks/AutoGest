// autogest-app/backend/middleware/profileUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storageDir = 'public/avatars/';

// Asegurarse de que el directorio de almacenamiento exista
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storageDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user.id;
        // --- INICIO DE LA MODIFICACIÓN ---
        // Genera un nombre de archivo único basado en el campo (avatar o logo) y el ID de usuario
        const uniqueSuffix = Date.now();
        cb(null, `${file.fieldname}-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
        // --- FIN DE LA MODIFICACIÓN ---
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    if (allowedTypes.test(file.mimetype)) {
        return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, WEBP)'));
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB
});

// --- INICIO DE LA MODIFICACIÓN ---
// Middleware para manejar múltiples campos de archivo: 'avatar' y 'logo'
module.exports = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]);
// --- FIN DE LA MODIFICACIÓN ---