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
        cb(null, `avatar-${userId}${path.extname(file.originalname)}`);
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
    limits: { fileSize: 10 * 1024 * 1024 } // Aumentar límite a 10MB
});

module.exports = upload.single('avatar');