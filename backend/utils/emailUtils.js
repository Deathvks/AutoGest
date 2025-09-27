// autogest-app/backend/utils/emailUtils.js
const nodemailer = require('nodemailer');
const https = require('https');

// Log para verificar que las variables de entorno se están leyendo al inicio
console.log('[EMAIL_CONFIG] Cargando configuración de email...');
console.log(`[EMAIL_CONFIG] HOST: ${process.env.EMAIL_HOST}`);
console.log(`[EMAIL_CONFIG] PORT: ${process.env.EMAIL_PORT}`);
console.log(`[EMAIL_CONFIG] USER: ${process.env.EMAIL_USER ? 'Definido' : 'NO DEFINIDO'}`);
console.log(`[EMAIL_CONFIG] PASS: ${process.env.EMAIL_PASS ? 'Definido' : 'NO DEFINIDO'}`);
console.log(`[EMAIL_CONFIG] FROM: ${process.env.FROM_EMAIL}`);

const transporterConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    logger: true,
    debug: false
};

console.log('[EMAIL_CONFIG] Configuración del transportador de Nodemailer:', JSON.stringify({
    ...transporterConfig,
    auth: {
        user: transporterConfig.auth.user,
        pass: transporterConfig.auth.pass ? '******' : 'NO DEFINIDO'
    }
}, null, 2));

const transporter = nodemailer.createTransport(transporterConfig);

exports.sendVerificationEmail = async (toEmail, code) => {
    const mailOptions = {
        from: `"AutoGest" <${process.env.FROM_EMAIL}>`,
        to: toEmail,
        subject: 'Código de Verificación - AutoGest',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #B8860B;">¡Bienvenido a AutoGest!</h2>
                <p>Gracias por registrarte. Para completar tu registro, por favor, usa el siguiente código de verificación:</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #B8860B; margin: 20px 0; text-align: center;">
                    ${code}
                </p>
                <p>Si no has solicitado este registro, puedes ignorar este correo.</p>
                <p>El equipo de AutoGest</p>
            </div>
        `,
    };

    try {
        console.log(`[EMAIL_SEND] Intentando enviar correo de verificación a ${toEmail}...`);
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL_SUCCESS] Correo de verificación enviado con éxito a ${toEmail}`);
    } catch (error) {
        console.error(`[EMAIL_ERROR] Error detallado al enviar correo a ${toEmail}:`, error);
        throw new Error('No se pudo enviar el correo de verificación.');
    }
};

exports.sendPasswordResetEmail = async (toEmail, token) => {
    const baseUrl = process.env.FRONTEND_URL || 'https://www.auto-gest.es';
    const resetUrl = `${baseUrl}/reset-password/${token}`;

    const mailOptions = {
        from: `"AutoGest" <${process.env.FROM_EMAIL}>`,
        to: toEmail,
        subject: 'Restablecimiento de Contraseña - AutoGest',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #B8860B;">Solicitud de Restablecimiento de Contraseña</h2>
                <p>Has recibido este correo porque tú (o alguien más) ha solicitado restablecer la contraseña de tu cuenta.</p>
                <p>Por favor, haz clic en el siguiente botón para completar el proceso. El enlace es válido por una hora.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #B8860B; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        RESTABLECER CONTRASEÑA
                    </a>
                </div>
                <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
                <a href="${resetUrl}" style="color: #B8860B; text-decoration: none; word-break: break-all;">${resetUrl}</a>
                <p style="margin-top: 20px;">Si no has solicitado esto, por favor, ignora este correo y tu contraseña permanecerá sin cambios.</p>
                <p>El equipo de AutoGest</p>
            </div>
        `,
    };

    try {
        console.log(`[EMAIL_SEND] Intentando enviar correo de restablecimiento a ${toEmail}...`);
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL_SUCCESS] Correo de restablecimiento enviado con éxito a ${toEmail}`);
    } catch (error) {
        console.error(`[EMAIL_ERROR] Error detallado al enviar correo de restablecimiento a ${toEmail}:`, error);
        throw new Error('No se pudo enviar el correo de restablecimiento.');
    }
};

// --- INICIO DE LA MODIFICACIÓN ---
const downloadPdf = (url) => {
    return new Promise((resolve, reject) => {
        const request = (urlToFetch) => {
            https.get(urlToFetch, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    // Si es una redirección, llamamos a la función de nuevo con la nueva URL.
                    request(res.headers.location);
                } else if (res.statusCode !== 200) {
                    reject(new Error(`Fallo al descargar el PDF. Código de estado: ${res.statusCode}`));
                } else {
                    const data = [];
                    res.on('data', (chunk) => data.push(chunk));
                    res.on('end', () => resolve(Buffer.concat(data)));
                }
            }).on('error', (err) => reject(err));
        };
        request(url);
    });
};
// --- FIN DE LA MODIFICACIÓN ---

exports.sendSubscriptionInvoiceEmail = async (toEmail, customerName, invoicePdfUrl, invoiceNumber) => {
    try {
        console.log(`[INVOICE_EMAIL] Descargando factura desde: ${invoicePdfUrl}`);
        const pdfBuffer = await downloadPdf(invoicePdfUrl);
        console.log(`[INVOICE_EMAIL] Factura descargada, tamaño: ${pdfBuffer.length} bytes.`);

        const mailOptions = {
            from: `"AutoGest" <${process.env.FROM_EMAIL}>`,
            to: toEmail,
            subject: `Tu factura de AutoGest #${invoiceNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2 style="color: #B8860B;">Gracias por tu suscripción a AutoGest</h2>
                    <p>Hola ${customerName},</p>
                    <p>Adjuntamos la factura correspondiente a tu suscripción. Apreciamos tu confianza en nosotros.</p>
                    <p>Si tienes cualquier pregunta, no dudes en contactarnos.</p>
                    <p>Atentamente,<br>El equipo de AutoGest</p>
                </div>
            `,
            attachments: [{
                filename: `factura_autogest_${invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            }],
        };

        console.log(`[INVOICE_EMAIL] Intentando enviar factura a ${toEmail}...`);
        await transporter.sendMail(mailOptions);
        console.log(`[INVOICE_SUCCESS] Factura enviada con éxito a ${toEmail}`);

    } catch (error) {
        console.error(`[INVOICE_ERROR] Error detallado al enviar factura a ${toEmail}:`, error);
    }
};