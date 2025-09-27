// autogest-app/backend/controllers/subscriptionController.js
const { createSubscription } = require('./subscription/createSubscription');
const { getSubscriptionStatus } = require('./subscription/getSubscriptionStatus');
const { cancelSubscription } = require('./subscription/cancelSubscription');
const { handleWebhook } = require('./subscription/handleWebhook');
const { syncSubscription } = require('./subscription/syncSubscription');

module.exports = {
    createSubscription,
    getSubscriptionStatus,
    cancelSubscription,
    handleWebhook,
    syncSubscription,
};