// autogest-app/backend/controllers/subscription/createSubscription.js
const { User } = require('../../models');
const { stripe, getStripeConfig } = require('./stripeConfig');

exports.createSubscription = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        const userId = req.user.id;
        const { priceId } = getStripeConfig();
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        let customerId = user.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            customerId = customer.id;
            await user.update({ stripeCustomerId: customerId });
        } else {
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
            await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
        }

        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'error_if_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });

    } catch (error) {
        console.error('Error creando suscripción:', error);
        res.status(500).json({ error: 'Error al crear la suscripción' });
    }
};