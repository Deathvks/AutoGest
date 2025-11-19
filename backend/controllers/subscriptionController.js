// autogest-app/backend/controllers/subscriptionController.js
const { createSubscription } = require('./subscription/createSubscription');
const { getSubscriptionStatus } = require('./subscription/getSubscriptionStatus');
const { cancelSubscription } = require('./subscription/cancelSubscription');
const { handleWebhook } = require('./subscription/handleWebhook');
const { syncSubscription } = require('./subscription/syncSubscription');
const { reactivateSubscription } = require('./subscription/reactivateSubscription');
const { createCustomerPortalSession } = require('./subscription/createCustomerPortalSession');
// --- INICIO DE LA MODIFICACIÓN ---
const { downloadLatestInvoice } = require('./subscription/downloadLatestInvoice');
// --- FIN DE LA MODIFICACIÓN ---

module.exports = {
    createSubscription,
    getSubscriptionStatus,
    cancelSubscription,
    handleWebhook,
    syncSubscription,
    reactivateSubscription,
    createCustomerPortalSession,
    // --- INICIO DE LA MODIFICACIÓN ---
    downloadLatestInvoice,
    // --- FIN DE LA MODIFICACIÓN ---
};