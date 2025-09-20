// autogest-app/frontend/src/pages/SubscriptionPage.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCreditCard, faCheckCircle, faExclamationTriangle, faTimesCircle, faSpinner,
    faCar, faFileInvoiceDollar, faChartLine, faWrench, faUsers, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST);

// --- Componente de Beneficios Premium ---
const SubscriptionBenefits = () => {
    const benefits = [
        { icon: faCar, title: 'Gestión de Inventario Sin Límites', description: 'Añade, edita y controla todos los vehículos de tu stock sin restricciones.' },
        { icon: faFileInvoiceDollar, title: 'Análisis de Rentabilidad', description: 'Calcula automáticamente el beneficio real de cada venta, incluyendo gastos asociados.' },
        { icon: faChartLine, title: 'Dashboard Inteligente', description: 'Visualiza el rendimiento de tu negocio con gráficos y estadísticas clave en tiempo real.' },
        { icon: faUsers, title: 'Facturación Profesional', description: 'Genera facturas y proformas con los datos de tu empresa y tus clientes en segundos.' },
        { icon: faWrench, title: 'Control Post-Venta', description: 'Registra y gestiona incidencias para ofrecer un servicio al cliente excepcional.' },
        { icon: faShieldAlt, title: 'Seguridad y Confianza', description: 'Tus datos están protegidos con copias de seguridad automáticas en la nube.' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
                <div key={benefit.title} className="group bg-component-bg-hover dark:bg-component-bg p-6 rounded-xl border border-border-color shadow-sm transition-all duration-300 hover:shadow-xl hover:border-accent hover:scale-[1.03] cursor-pointer">
                    <FontAwesomeIcon icon={benefit.icon} className="text-accent text-3xl mb-4 transition-transform duration-300 group-hover:scale-110" />
                    <h4 className="font-bold text-text-primary text-lg mb-2 transition-colors duration-300 group-hover:text-accent">{benefit.title}</h4>
                    <p className="text-text-secondary text-sm leading-relaxed">{benefit.description}</p>
                </div>
            ))}
        </div>
    );
};


// --- Componente del Formulario de Pago ---
const CheckoutForm = ({ onSuccessfulPayment }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [adBlockerDetected, setAdBlockerDetected] = useState(false);
    const [isBraveBrowser, setIsBraveBrowser] = useState(false);
    // --- INICIO DE LA MODIFICACIÓN ---
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        // Observador para detectar cambios en el tema y forzar la recarga del CardElement
        const observer = new MutationObserver(() => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            setTheme(newTheme);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const cardElementOptions = useMemo(() => ({
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
    // --- FIN DE LA MODIFICACIÓN ---

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
            const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);

            if (confirmError) {
                setError(confirmError.message);
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
                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                        <CardElement key={theme} options={cardElementOptions} />
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
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

// --- Componente para Mostrar el Estado de la Suscripción ---
const SubscriptionStatus = ({ status, expiry, onCancel }) => {
    const [isCancelling, setIsCancelling] = useState(false);
    
    const handleCancel = async () => {
        if (window.confirm('¿ESTÁS SEGURO DE QUE QUIERES CANCELAR TU SUSCRIPCIÓN? SE MANTENDRÁ ACTIVA HASTA EL FINAL DEL PERÍODO DE FACTURACIÓN.')) {
            setIsCancelling(true);
            try {
                await onCancel();
            } catch (error) {
                alert(error.message);
            } finally {
                setIsCancelling(false);
            }
        }
    };

    const statusInfo = {
        active: { icon: faCheckCircle, color: 'text-green-accent', title: 'SUSCRIPCIÓN ACTIVA', message: `GRACIAS POR FORMAR PARTE DE AUTOGEST. TU PLAN SE RENOVARÁ EL ${new Date(expiry).toLocaleDateString()}.` },
        cancelled: { icon: faTimesCircle, color: 'text-yellow-accent', title: 'SUSCRIPCIÓN CANCELADA', message: `TU ACCESO PERMANECERÁ ACTIVO HASTA EL ${new Date(expiry).toLocaleDateString()}.` },
        past_due: { icon: faExclamationTriangle, color: 'text-red-accent', title: 'PAGO PENDIENTE', message: 'NO SE PUDO PROCESAR TU PAGO. POR FAVOR, ACTUALIZA TU MÉTODO DE PAGO.' },
        inactive: { icon: faExclamationTriangle, color: 'text-red-accent', title: 'SUSCRIPCIÓN INACTIVA', message: 'TU SUSCRIPCIÓN HA TERMINADO. RENUÉVALA PARA CONTINUAR.' },
    };

    const currentStatus = statusInfo[status] || statusInfo.inactive;

    return (
        <div className="p-8 bg-component-bg rounded-xl border border-border-color shadow-lg text-center h-full flex flex-col justify-center">
            <FontAwesomeIcon icon={currentStatus.icon} className={`w-16 h-16 mx-auto mb-4 ${currentStatus.color}`} />
            <h3 className={`text-xl font-bold ${currentStatus.color}`}>{currentStatus.title}</h3>
            <p className="text-text-secondary mt-2">{currentStatus.message}</p>
            {status === 'active' && (
                 <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="mt-6 bg-red-accent/10 text-red-accent font-semibold py-2 px-6 rounded-lg hover:bg-red-accent/20 transition-colors disabled:opacity-50"
                >
                    {isCancelling ? <FontAwesomeIcon icon={faSpinner} spin /> : 'CANCELAR SUSCRIPCIÓN'}
                </button>
            )}
        </div>
    );
};

// --- Componente de Contenido de la Página ---
const SubscriptionPageContent = () => {
    const { user } = useContext(AuthContext);
    const [status, setStatus] = useState(null);
    const [expiry, setExpiry] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const data = await api.subscriptions.getSubscriptionStatus();
            setStatus(data.subscriptionStatus);
            setExpiry(data.subscriptionExpiry);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchStatus();
    }, []);

    if (user.role === 'admin' || user.role === 'technician') {
        return (
             <div className="p-8 bg-component-bg rounded-xl border border-border-color text-center">
                 <FontAwesomeIcon icon={faCheckCircle} className="w-16 h-16 mx-auto mb-4 text-green-accent" />
                 <h3 className="text-xl font-bold text-green-accent">CUENTA DE ACCESO COMPLETO</h3>
                 <p className="text-text-secondary mt-2">TU ROL DE {user.role.toUpperCase()} NO REQUIERE UNA SUSCRIPCIÓN DE PAGO.</p>
            </div>
        );
    }
    
    if (loading) {
        return <div className="text-center p-8"><FontAwesomeIcon icon={faSpinner} spin size="2x" /></div>;
    }

    const showPaymentForm = status === 'inactive' || status === 'past_due';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="lg:pt-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-text-primary tracking-tight">
                    LA HERRAMIENTA DEFINITIVA PARA <span className="text-accent">COMPRA VENTAS DE COCHES</span>
                </h2>
                <p className="mt-4 text-lg text-text-secondary">
                    Desbloquea todo el potencial de tu negocio. AutoGest te da el control total para que te centres en lo que realmente importa: vender.
                </p>
                <div className="mt-10 pt-8 border-t border-border-color">
                    <h3 className="text-xl font-semibold text-text-primary mb-6">TODO INCLUIDO EN TU PLAN:</h3>
                    <SubscriptionBenefits />
                </div>
            </div>
            <div>
                {showPaymentForm ? (
                    <CheckoutForm onSuccessfulPayment={fetchStatus} />
                ) : (
                    <SubscriptionStatus status={status} expiry={expiry} onCancel={fetchStatus} />
                )}
            </div>
        </div>
    );
};

// --- Contenedor Principal con el Proveedor de Stripe ---
const SubscriptionPage = () => {
    return (
        <div className="max-w-7xl mx-auto">
             <Elements stripe={stripePromise} options={{ }}>
                <SubscriptionPageContent />
             </Elements>
        </div>
    );
};

export default SubscriptionPage;