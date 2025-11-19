// backend/convert-images.js
require('dotenv').config();
const { User, Car, Expense, sequelize } = require('./models');
const { processImageToWebp } = require('./utils/imageProcessor');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

/**
 * Helper para convertir una ruta de BD (ej: /uploads/img.jpg) a WebP
 * y devolver la nueva ruta de BD (ej: /uploads/img.webp).
 */
const convertDbPath = async (dbPath) => {
    if (!dbPath || typeof dbPath !== 'string') return dbPath;
    
    // Ignoramos archivos que no son imágenes típicas o que ya son WebP
    const lower = dbPath.toLowerCase();
    if (lower.endsWith('.webp') || lower.endsWith('.pdf')) return dbPath;

    // Convertir ruta web (/uploads/...) a ruta de sistema de archivos
    // Quitamos la barra inicial para unir con publicDir
    const relativePath = dbPath.startsWith('/') ? dbPath.slice(1) : dbPath;
    const absolutePath = path.join(publicDir, relativePath);

    try {
        // Procesar la imagen (convierte y borra la original)
        const newAbsolutePath = await processImageToWebp(absolutePath);

        // Si la ruta cambió (se convirtió), reconstruimos la ruta web para la BD
        if (newAbsolutePath !== absolutePath) {
            const dir = path.dirname(dbPath); // Mantiene la estructura original (ej: /uploads)
            const name = path.basename(newAbsolutePath);
            return `${dir}/${name}`; // Devuelve con / al inicio si lo tenía
        }
    } catch (error) {
        console.error(`❌ Error procesando ${dbPath}:`, error.message);
    }

    return dbPath;
};

const runMigration = async () => {
    console.log('🚀 Iniciando conversión masiva de imágenes a WebP...');

    try {
        // 1. Procesar Usuarios (Avatares y Logos)
        const users = await User.findAll();
        console.log(`> Revisando ${users.length} usuarios...`);
        for (const user of users) {
            let changed = false;
            if (user.avatarUrl) {
                const newUrl = await convertDbPath(user.avatarUrl);
                if (newUrl !== user.avatarUrl) {
                    user.avatarUrl = newUrl;
                    changed = true;
                }
            }
            if (user.logoUrl) {
                const newUrl = await convertDbPath(user.logoUrl);
                if (newUrl !== user.logoUrl) {
                    user.logoUrl = newUrl;
                    changed = true;
                }
            }
            if (changed) await user.save();
        }

        // 2. Procesar Coches (Imagen principal y Documentos)
        const cars = await Car.findAll();
        console.log(`> Revisando ${cars.length} coches...`);
        for (const car of cars) {
            let changed = false;

            // Imagen principal
            if (car.imageUrl) {
                const newUrl = await convertDbPath(car.imageUrl);
                if (newUrl !== car.imageUrl) {
                    car.imageUrl = newUrl;
                    changed = true;
                }
            }

            // Campos JSON de documentos
            const docFields = ['technicalSheetUrl', 'registrationCertificateUrl', 'otherDocumentsUrls'];
            for (const field of docFields) {
                let docs = car[field];
                // Aseguramos que sea un array iterable
                if (typeof docs === 'string') {
                    try { docs = JSON.parse(docs); } catch (e) { docs = []; }
                }
                
                if (Array.isArray(docs) && docs.length > 0) {
                    let docsChanged = false;
                    const newDocs = await Promise.all(docs.map(async (doc) => {
                        if (doc && doc.path) {
                            const newPath = await convertDbPath(doc.path);
                            if (newPath !== doc.path) {
                                docsChanged = true;
                                return { ...doc, path: newPath };
                            }
                        }
                        return doc;
                    }));

                    if (docsChanged) {
                        car[field] = newDocs; // Sequelize se encarga de stringify al guardar JSON
                        changed = true;
                    }
                }
            }
            if (changed) await car.save();
        }

        // 3. Procesar Gastos (Adjuntos)
        const expenses = await Expense.findAll();
        console.log(`> Revisando ${expenses.length} gastos...`);
        for (const expense of expenses) {
            let attachments = expense.attachments;
            if (typeof attachments === 'string') {
                try { attachments = JSON.parse(attachments); } catch (e) { attachments = []; }
            }

            if (Array.isArray(attachments) && attachments.length > 0) {
                let changed = false;
                const newAttachments = await Promise.all(attachments.map(async (attPath) => {
                    const newPath = await convertDbPath(attPath);
                    if (newPath !== attPath) {
                        changed = true;
                        return newPath;
                    }
                    return attPath;
                }));

                if (changed) {
                    expense.attachments = newAttachments;
                    await expense.save();
                }
            }
        }

        console.log('✅ ¡Conversión completa! Todas las imágenes antiguas ahora son WebP.');

    } catch (error) {
        console.error('❌ Error fatal durante la migración:', error);
    } finally {
        await sequelize.close();
    }
};

runMigration();