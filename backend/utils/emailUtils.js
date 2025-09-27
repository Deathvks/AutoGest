// autogest-app/backend/utils/emailUtils.js
const nodemailer = require('nodemailer');

// 1. Log para verificar que las variables de entorno se están leyendo al inicio
console.log('[EMAIL_CONFIG] Cargando configuración de email...');
console.log(`[EMAIL_CONFIG] HOST: ${process.env.EMAIL_HOST}`);
console.log(`[EMAIL_CONFIG] PORT: ${process.env.EMAIL_PORT}`);
console.log(`[EMAIL_CONFIG] USER: ${process.env.EMAIL_USER ? 'Definido' : 'NO DEFINIDO'}`);
console.log(`[EMAIL_CONFIG] PASS: ${process.env.EMAIL_PASS ? 'Definido' : 'NO DEFINIDO'}`);
console.log(`[EMAIL_CONFIG] FROM: ${process.env.FROM_EMAIL}`);

// 2. Definimos la configuración del transportador en un objeto para poder registrarla
const transporterConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // Asegurarse de que la comparación sea con una cadena
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Añadimos más logs para depuración de la conexión
    logger: true,
    debug: false // Se puede poner a true para ver aún más detalle
};

console.log('[EMAIL_CONFIG] Configuración del transportador de Nodemailer:', JSON.stringify({
    ...transporterConfig,
    auth: { // Ocultamos la contraseña en el log por seguridad
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
    // --- INICIO DE LA MODIFICACIÓN ---
    // Usamos la variable de entorno para construir la URL base.
    const baseUrl = process.env.FRONTEND_URL || 'https://www.auto-gest.es';
    const resetUrl = `${baseUrl}/reset-password/${token}`;
    // --- FIN DE LA MODIFICACIÓN ---

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