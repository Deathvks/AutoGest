// autogest-app/frontend/src/pages/Subscription/CheckoutForm.jsx
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CheckoutForm = ({ onSubscriptionSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { syncSubscriptionStatus } = useAuth();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const cardElementOptions = {
        style: {
            base: {
                color: "#32325d",
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#aab7c4"
                }
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a"
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        if (!stripe || !elements) {
            setError("Stripe.js no se ha cargado correctamente.");
            setProcessing(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (paymentMethodError) {
            setError(paymentMethodError.message);
            setProcessing(false);
            return;
        }

        try {
            const { data } = await api.post('/subscriptions/create-subscription', {
                paymentMethodId: paymentMethod.id,
            });

            if (data.status === 'active') {
                // --- Caso 1: Pago directo exitoso (sin 3D Secure) ---
                console.log("Suscripción activada directamente.");
                await syncSubscriptionStatus();
                onSubscriptionSuccess();
            } else {
                // --- Caso 2: Se necesita confirmación del pago (3D Secure) ---
                console.log("Se necesita confirmación del pago. Client Secret:", data.clientSecret);
                const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);

                if (confirmError) {
                    throw new Error(confirmError.message);
                }
                
                console.log("Confirmación de pago exitosa.");
                await syncSubscriptionStatus();
                onSubscriptionSuccess();
            }

        } catch (err) {
            // --- INICIO DE LA MODIFICACIÓN ---
            // Manejo de errores, incluyendo el caso 'requires_action'
            const errData = err.response?.data;
            if (errData && errData.error === 'requires_action') {
                // --- Caso 3: El backend pide explícitamente la acción del usuario ---
                console.log("El backend requiere acción. Confirmando con el nuevo client secret...");
                const { error: confirmError } = await stripe.confirmCardPayment(errData.paymentIntentClientSecret);

                if (confirmError) {
                    setError(confirmError.message);
                } else {
                    console.log("Confirmación de pago tras 'requires_action' exitosa.");
                    await syncSubscriptionStatus();
                    onSubscriptionSuccess();
                }
            } else {
                // --- Otros errores ---
                const errorMessage = errData?.error || err.message || "Ocurrió un error inesperado.";
                setError(errorMessage);
            }
            // --- FIN DE LA MODIFICACIÓN ---
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datos de la tarjeta
                </label>
                <div className="p-3 border border-gray-300 rounded-md">
                    <CardElement options={cardElementOptions} />
                </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
                {processing ? 'Procesando...' : 'Suscribirse (9,99€/mes)'}
            </button>
        </form>
    );
};

export default CheckoutForm;