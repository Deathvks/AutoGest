// autogest-app/backend/controllers/subscription/stripeConfig.js
const stripe = require('stripe')(
    process.env.NODE_ENV === 'production'
        ? process.env.STRIPE_SECRET_KEY_LIVE
        : process.env.STRIPE_SECRET_KEY_TEST
);

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