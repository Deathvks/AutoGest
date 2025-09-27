// autogest-app/backend/controllers/subscriptionController.js
const { createSubscription } = require('./subscription/createSubscription');
const { getSubscriptionStatus } = require('./subscription/getSubscriptionStatus');
const { cancelSubscription } = require('./subscription/cancelSubscription');
const { handleWebhook } = require('./subscription/handleWebhook');
const { syncSubscription } = require('./subscription/syncSubscription');
const { reactivateSubscription } = require('./subscription/reactivateSubscription'); // --- INICIO DE LA MODIFICACIÓN ---

module.exports = {
    createSubscription,
    getSubscriptionStatus,
    cancelSubscription,
    handleWebhook,
    syncSubscription,
    reactivateSubscription, // --- INICIO DE LA MODIFICACIÓN ---
};