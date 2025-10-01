// autogest-app/backend/controllers/subscription/stripeConfig.js
const stripePackage = require('stripe');

// --- INICIO DE LA MODIFICACIÓN ---
console.log('[STRIPE_CONFIG] Loading Stripe configuration...');
console.log(`[STRIPE_CONFIG] NODE_ENV: ${process.env.NODE_ENV}`);

const stripeKey = process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY_LIVE
    : process.env.STRIPE_SECRET_KEY_TEST;

if (!stripeKey) {
    console.error('[STRIPE_CONFIG] FATAL ERROR: Stripe secret key is missing for the current environment.');
    console.error(`[STRIPE_CONFIG] STRIPE_SECRET_KEY_LIVE is ${process.env.STRIPE_SECRET_KEY_LIVE ? 'defined' : 'UNDEFINED'}`);
    console.error(`[STRIPE_CONFIG] STRIPE_SECRET_KEY_TEST is ${process.env.STRIPE_SECRET_KEY_TEST ? 'defined' : 'UNDEFINED'}`);
    
    // Forzar la salida con un código de error para que PM2 lo registre como un fallo.
    process.exit(1);
} else {
    console.log('[STRIPE_CONFIG] Stripe secret key loaded successfully.');
}

const stripe = stripePackage(stripeKey);
// --- FIN DE LA MODIFICACIÓN ---

const getStripeConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        priceId: isProduction ? process.env.STRIPE_PRICE_ID_LIVE : process.env.STRIPE_PRICE_ID_TEST,
        webhookSecret: isProduction ? process.env.STRIPE_WEBHOOK_SECRET_LIVE : process.env.STRIPE_WEBHOOK_SECRET_TEST,
    };
};

module.exports = {
    stripe,
    getStripeConfig,
};