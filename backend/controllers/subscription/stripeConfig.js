// autogest-app/backend/controllers/subscription/stripeConfig.js
const Stripe = require('stripe');

// --- INICIO DE LA MODIFICACIÓN ---
// Se ha refactorizado la lógica para que sea más clara y robusta.
// Se han añadido logs para depurar qué configuración se está cargando.

// Determinar el entorno de forma explícita.
const isProduction = process.env.NODE_ENV === 'production';
console.log(`[STRIPE_CONFIG] Entorno detectado: ${process.env.NODE_ENV || 'development'}`);

// Seleccionar las claves y el ID de precio según el entorno.
const secretKey = isProduction 
    ? process.env.STRIPE_SECRET_KEY_LIVE 
    : process.env.STRIPE_SECRET_KEY_TEST;

const priceId = isProduction 
    ? process.env.STRIPE_PRICE_ID_LIVE 
    : process.env.STRIPE_PRICE_ID_TEST;

const webhookSecret = isProduction 
    ? process.env.STRIPE_WEBHOOK_SECRET_LIVE 
    : process.env.STRIPE_WEBHOOK_SECRET_TEST;

// Validar que las variables necesarias estén presentes.
if (!secretKey || !priceId || !webhookSecret) {
    console.error('--- ERROR CRÍTICO DE CONFIGURACIÓN DE STRIPE ---');
    if (!secretKey) console.error('Falta la variable de entorno STRIPE_SECRET_KEY');
    if (!priceId) console.error('Falta la variable de entorno STRIPE_PRICE_ID');
    if (!webhookSecret) console.error('Falta la variable de entorno STRIPE_WEBHOOK_SECRET');
    console.error('Asegúrate de que el fichero .env está completo y en la raíz del backend.');
    process.exit(1); // Detener la aplicación si la configuración es incorrecta.
}

console.log(`[STRIPE_CONFIG] Usando Price ID: ${priceId}`);

// Inicializar Stripe con la clave secreta correcta.
const stripe = new Stripe(secretKey, {
    apiVersion: '2024-04-10', // Mantén la API version actualizada si es necesario.
});

// Función para exportar la configuración.
const getStripeConfig = () => ({
    priceId,
    webhookSecret
});

module.exports = {
    stripe,
    getStripeConfig
};
// --- FIN DE LA MODIFICACIÓN ---