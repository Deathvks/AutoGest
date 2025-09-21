// autogest-app/frontend/src/pages/Subscription/CheckoutForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faSpinner, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const CheckoutForm = ({ onSuccessfulPayment }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [adBlockerDetected, setAdBlockerDetected] = useState(false);
    const [isBraveBrowser, setIsBraveBrowser] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            setTheme(newTheme);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const cardElementOptions = useMemo(() => ({
        hidePostalCode: true,
        style: {
            base: {
                color: theme === 'dark' ? '#EAEAEA' : '#111827',
                fontFamily: 'Inter, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: theme === 'dark' ? '#888888' : '#6b7280',
                },
            },
            invalid: {
                color: '#dc2626',
                iconColor: '#dc2626',
            },
        },
    }), [theme]);

    useEffect(() => {
        const detectAdBlocker = async () => {
            if (navigator.brave && await navigator.brave.isBrave()) {
                setIsBraveBrowser(true);
                setAdBlockerDetected(true);
                return;
            }

            const bait = document.createElement('div');
            bait.innerHTML = '&nbsp;';
            bait.className = 'ad-banner';
            Object.assign(bait.style, {
                position: 'absolute', height: '1px', width: '1px', top: '-1px', left: '-1px',
            });
            document.body.appendChild(bait);

            setTimeout(() => {
                if (bait.offsetHeight === 0) {
                    setAdBlockerDetected(true);
                }
                document.body.removeChild(bait);
            }, 100);
        };
        detectAdBlocker();
    }, []);


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

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
            const { clientSecret } = await api.subscriptions.createSubscription(paymentMethod.id);
            
            if (clientSecret) {
                const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
                if (confirmError) {
                    setError(confirmError.message);
                } else {
                    onSuccessfulPayment();
                }
            } else {
                onSuccessfulPayment();
            }

        } catch (apiError) {
            setError(apiError.message);
        }

        setProcessing(false);
    };

    return (
        <div className="p-8 bg-component-bg rounded-xl border border-border-color shadow-lg h-full flex flex-col">
            <h3 className="text-xl font-bold text-text-primary mb-2">COMPLETA TU SUSCRIPCIÓN</h3>
            <p className="text-text-secondary mb-6">Acceso completo a todas las herramientas por un único pago mensual.</p>
            <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
                <div className="flex-grow">
                    {adBlockerDetected && (
                        <div className="bg-yellow-accent/10 text-yellow-accent p-3 rounded-lg border border-border-color flex items-center gap-3 mb-4">
                            <FontAwesomeIcon icon={faShieldAlt} className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">
                                {isBraveBrowser
                                    ? '¿USAS BRAVE? PARA ASEGURAR QUE EL PAGO FUNCIONE, DESACTIVA LOS ESCUDOS (ICONO DEL LEÓN) PARA ESTE SITIO.'
                                    : '¡ATENCIÓN! HEMOS DETECTADO UN BLOQUEADOR. PARA ASEGURAR QUE EL PAGO FUNCIONE, DESACTÍVALO TEMPORALMENTE.'}
                            </p>
                        </div>
                    )}
                    <label className="block text-sm font-medium text-text-secondary mb-2">DATOS DE LA TARJETA</label>
                    <div className="p-4 bg-background rounded-lg border border-border-color">
                        <CardElement key={theme} options={cardElementOptions} />
                    </div>
                </div>
                {error && (
                    <div className="text-red-accent text-sm flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="w-full bg-accent text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : 'SUSCRIBIRME AHORA (59,90€/MES)'}
                </button>
            </form>
        </div>
    );
};

export default CheckoutForm;