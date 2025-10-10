// autogest-app/frontend/src/pages/Subscription/CheckoutForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faSpinner, faShieldAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const CheckoutForm = ({ onSuccessfulPayment }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [adBlockerDetected, setAdBlockerDetected] = useState(false);
    const [isBraveBrowser, setIsBraveBrowser] = useState(false);
    const [theme, setTheme] = useState(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');

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
                color: theme === 'dark' ? '#F0EEF7' : '#18181b',
                fontFamily: 'Inter, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: theme === 'dark' ? '#cbd5e1' : '#27272a',
                },
                iconColor: theme === 'dark' ? '#cbd5e1' : '#27272a',
            },
            invalid: {
                color: theme === 'dark' ? '#f87171' : '#dc2626',
                iconColor: theme === 'dark' ? '#f87171' : '#dc2626',
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
            const response = await api.subscriptions.createSubscription(paymentMethod.id);

            if (response.status === 'active' && !response.clientSecret) {
                onSuccessfulPayment();
                return;
            }

            if (response.clientSecret) {
                const { error: confirmError } = await stripe.confirmCardPayment(response.clientSecret);

                if (confirmError) {
                    setError(confirmError.message);
                } else {
                    onSuccessfulPayment();
                }
            } else {
                setError('No se pudo procesar el pago. Por favor, inténtalo de nuevo.');
            }

        } catch (apiError) {
            setError(apiError.message || 'Error al procesar el pago.');
        }

        setProcessing(false);
    };

    return (
        <div className="p-8 bg-component-bg backdrop-blur-lg rounded-2xl border border-border-color shadow-2xl h-full flex flex-col">
            <h3 className="text-xl font-bold text-text-primary mb-2 animate-fade-in-down">COMPLETA TU SUSCRIPCIÓN</h3>
            <p className="text-text-secondary mb-6 animate-fade-in-down" style={{ animationDelay: '150ms' }}>Acceso completo a todas las herramientas por un único pago mensual.</p>
            <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
                <div className="flex-grow animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    {adBlockerDetected && (
                        // --- INICIO DE LA MODIFICACIÓN ---
                        <div className="bg-yellow-accent/10 text-yellow-accent p-3 rounded-lg flex items-center gap-3 mb-4">
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                            <FontAwesomeIcon icon={faShieldAlt} className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">
                                {isBraveBrowser
                                    ? '¿USAS BRAVE? SU BLOQUEADOR PUEDE OCULTAR OPCIONES DE PAGO. PARA VER TODAS LAS OPCIONES, DESACTIVA LOS ESCUDOS.'
                                    : '¡ATENCIÓN! HEMOS DETECTADO UN BLOQUEADOR. PARA ASEGURAR QUE EL PAGO FUNCIONE, DESACTÍVALO TEMPORALMENTE.'}
                            </p>
                        </div>
                    )}
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <div className="bg-blue-accent/10 text-blue-accent p-3 rounded-lg flex items-start gap-3 mb-4">
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                        <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">
                            Se te cobrará la parte proporcional de este mes. Tu suscripción se renovará por el importe completo el día 1 del mes siguiente.
                        </p>
                    </div>
                    <label className="block text-sm font-semibold text-text-primary mb-2 uppercase">Datos de la Tarjeta</label>
                    <div className="p-4 bg-component-bg-hover rounded-lg border border-border-color shadow-inner">
                        <CardElement key={theme} options={cardElementOptions} />
                    </div>
                </div>
                {error && (
                    <div className="text-red-accent text-sm flex items-center gap-2 font-semibold">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="w-full bg-accent text-white font-semibold py-3 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait animate-fade-in-up"
                    style={{ animationDelay: '450ms' }}
                >
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : 'SUSCRIBIRME AHORA (79,90€/MES)'}
                </button>
            </form>
        </div>
    );
};

export default CheckoutForm;