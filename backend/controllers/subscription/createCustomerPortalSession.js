// autogest-app/backend/controllers/subscription/createCustomerPortalSession.js
const { User } = require('../../models');
const { stripe } = require('./stripeConfig');

exports.createCustomerPortalSession = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'No se encontró un cliente de Stripe para este usuario.' });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.FRONTEND_URL}/subscription`,
        });

        res.json({ url: portalSession.url });

    } catch (error) {
        console.error('Error al crear la sesión del portal de cliente:', error);
        res.status(500).json({ error: 'No se pudo crear la sesión del portal del cliente.' });
    }
};