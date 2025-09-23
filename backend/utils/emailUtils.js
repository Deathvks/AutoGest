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