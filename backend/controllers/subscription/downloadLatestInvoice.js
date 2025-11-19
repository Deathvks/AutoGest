// autogest-app/backend/controllers/subscription/downloadLatestInvoice.js
const { stripe } = require('./stripeConfig');
const { User } = require('../../models');
const https = require('https');

// Función auxiliar para seguir redirecciones
const fetchUrl = (url, res) => {
    https.get(url, (response) => {
        // Si es una redirección (3xx), la seguimos
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            return fetchUrl(response.headers.location, res);
        }

        // Si no es 200 OK, devolvemos error
        if (response.statusCode !== 200) {
            return res.status(response.statusCode).json({ error: 'Error al obtener el archivo del proveedor.' });
        }

        // Si es correcto, hacemos pipe al cliente
        response.pipe(res);
    }).on('error', (err) => {
        console.error('Error en la descarga del PDF:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error de conexión al descargar la factura.' });
        }
    });
};

const downloadLatestInvoice = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'Usuario o suscripción no encontrados' });
        }

        const invoices = await stripe.invoices.list({
            customer: user.stripeCustomerId,
            limit: 1,
        });

        if (!invoices.data || invoices.data.length === 0) {
            return res.status(404).json({ error: 'No se han encontrado facturas' });
        }

        const latestInvoice = invoices.data[0];
        const pdfUrl = latestInvoice.invoice_pdf;

        if (!pdfUrl) {
            return res.status(404).json({ error: 'PDF no disponible todavía' });
        }

        // Preparamos las cabeceras de respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="factura_${latestInvoice.number || 'reciente'}.pdf"`);

        // Iniciamos la descarga siguiendo redirecciones
        fetchUrl(pdfUrl, res);

    } catch (error) {
        console.error('Error en downloadLatestInvoice:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error al procesar la solicitud' });
        }
    }
};

module.exports = { downloadLatestInvoice };