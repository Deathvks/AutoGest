// autogest-app/backend/utils/emailUtils.js
const nodemailer = require('nodemailer');

// 1. Configurar el transportador de correo usando las credenciales de Gmail del .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 2. Función para enviar el correo de verificación
exports.sendVerificationEmail = async (toEmail, code) => {
    const mailOptions = {
        from: `"AutoGest" <${process.env.EMAIL_USER}>`,
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
        // Lanzamos el error para que pueda ser capturado en el controlador
        throw new Error('No se pudo enviar el correo de verificación.');
    }
};

// --- INICIO DE LA MODIFICACIÓN ---
// 3. Función para enviar el correo de restablecimiento de contraseña (CON BOTÓN)
exports.sendPasswordResetEmail = async (toEmail, token) => {
    // La URL debe apuntar a tu frontend, a la página de restablecimiento de contraseña
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const mailOptions = {
        from: `"AutoGest" <${process.env.EMAIL_USER}>`,
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
// --- FIN DE LA MODIFICACIÓN ---