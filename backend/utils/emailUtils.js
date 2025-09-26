// autogest-app/backend/utils/emailUtils.js
const nodemailer = require('nodemailer');

// 1. Configurar el transportador de correo usando las credenciales SMTP genéricas del .env
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === 465, // true para 465, false para otros puertos como 587
    auth: {
        user: process.env.EMAIL_USER, // Tu email de login de Brevo
        pass: process.env.EMAIL_PASS, // Tu clave SMTP de Brevo
    },
});

// 2. Función para enviar el correo de verificación
exports.sendVerificationEmail = async (toEmail, code) => {
    const mailOptions = {
        // --- INICIO DE LA MODIFICACIÓN ---
        from: `"AutoGest" <${process.env.FROM_EMAIL}>`, // Usamos la nueva variable FROM_EMAIL
        // --- FIN DE LA MODIFICACIÓN ---
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
        await transporter.sendMail(mailOptions);
        console.log(`Correo de verificación enviado a ${toEmail}`);
    } catch (error) {
        console.error(`Error al enviar correo a ${toEmail}:`, error);
        throw new Error('No se pudo enviar el correo de verificación.');
    }
};

// 3. Función para enviar el correo de restablecimiento de contraseña
exports.sendPasswordResetEmail = async (toEmail, token) => {
    const resetUrl = `https://www.auto-gest.es/reset-password/${token}`;

    const mailOptions = {
        // --- INICIO DE LA MODIFICACIÓN ---
        from: `"AutoGest" <${process.env.FROM_EMAIL}>`, // Usamos la nueva variable FROM_EMAIL
        // --- FIN DE LA MODIFICACIÓN ---
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
        await transporter.sendMail(mailOptions);
        console.log(`Correo de restablecimiento de contraseña enviado a ${toEmail}`);
    } catch (error) {
        console.error(`Error al enviar correo de restablecimiento a ${toEmail}:`, error);
        throw new Error('No se pudo enviar el correo de restablecimiento.');
    }
};