// frontend/src/pages/SubscriptionPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner, faExclamationTriangle, faUsersCog, faCookieBite } from '@fortawesome/free-solid-svg-icons';

import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

import SubscriptionBenefits from './Subscription/SubscriptionBenefits';
import CheckoutForm from './Subscription/CheckoutForm';
import SubscriptionStatus from './Subscription/SubscriptionStatus';

const stripePublishableKey = import.meta.env.PROD
    ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE
    : import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST;

const stripePromise = loadStripe(stripePublishableKey);

const SubscriptionPageContent = ({ setSubscriptionSuccessModalOpen }) => {
    const { user, subscriptionStatus, refreshSubscriptionStatus, setPromptTrial } = useContext(AuthContext);
    
    const [cookieConsent, setCookieConsent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    const getConsentKey = () => {
        return user ? `cookie_consent_${user.id}` : 'cookie_consent_guest';
    };

    useEffect(() => {
        const consentKey = getConsentKey();
        const consent = localStorage.getItem(consentKey);
        setCookieConsent(consent);
        if (user) {
            setIsLoading(false);
        }
    }, [user]);

    const handleAcceptCookiesForPayment = () => {
        const consentKey = getConsentKey();
        localStorage.setItem(consentKey, 'accepted');
        setCookieConsent('accepted');
    };

    const handleSuccessfulPayment = () => {
        setPromptTrial(false); // Evita que el modal de prueba aparezca
        setIsVerifyingPayment(true);
        setVerificationError('');

        let attempts = 0;
        const maxAttempts = 12;
        const pollIntervals = [1000, 2000, 2000, 3000, 3000, 3000, 4000, 4000, 5000, 5000, 5000, 5000];

        const pollForStatus = async () => {
            if (attempts >= maxAttempts) {
                setVerificationError("La verificación tardó más de lo esperado. Por favor, recarga la página en unos momentos para ver el estado actualizado de tu suscripción.");
                setIsVerifyingPayment(false);
                return;
            }

            try {
                await api.subscriptions.syncSubscription();
                const freshUser = await api.getMe();

                if (freshUser.subscriptionStatus === 'active') {
                    await refreshSubscriptionStatus();
                    setSubscriptionSuccessModalOpen(true);
                    setIsVerifyingPayment(false);
                } else {
                    attempts++;
                    setTimeout(pollForStatus, pollIntervals[attempts] || 5000);
                }
            } catch (error) {
                attempts++;
                setTimeout(pollForStatus, pollIntervals[attempts] || 5000);
            }
        };

        setTimeout(pollForStatus, 2000);
    };

    const handleCancel = async () => {
        await api.subscriptions.cancelSubscription();
        await refreshSubscriptionStatus();
    };

    if (user.role === 'admin' || user.role === 'technician') {
        return (
            <div className="p-8 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <FontAwesomeIcon icon={faCheckCircle} className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-bold text-green-700 uppercase">Cuenta de Acceso Completo</h3>
                <p className="text-gray-600 mt-2">Tu rol de {user.role.toUpperCase()} no requiere una suscripción de pago.</p>
            </div>
        );
    }
    
    if (user.role === 'user' && user.companyId) {
        return (
            <div className="p-8 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <FontAwesomeIcon icon={faUsersCog} className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-700 uppercase">Suscripción Gestionada</h3>
                <p className="text-gray-600 mt-2">
                    La suscripción de esta cuenta es gestionada por la organización a la que perteneces.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return <div className="text-center p-8 text-accent"><FontAwesomeIcon icon={faSpinner} spin size="2x" /></div>;
    }

    const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'cancelled';
    
    if (isSubscribed) {
        return (
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight uppercase">Tu Suscripción</h1>
                    <p className="mt-4 text-lg text-gray-500">Gestiona el estado de tu plan y revisa los beneficios incluidos.</p>
                </div>
                <SubscriptionStatus status={subscriptionStatus} expiry={user.subscriptionExpiry} onCancel={handleCancel} />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase">Beneficios de tu Plan</h2>
                    <SubscriptionBenefits />
                </div>
            </div>
        );
    }
    
    const areCookiesAllowedForPayment = cookieConsent === 'accepted' || cookieConsent === 'necessary';
    
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-start">
            <div className="order-2 lg:order-1 lg:pt-4 animate-fade-in-up">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight uppercase">
                    La herramienta definitiva para <span className="text-accent">compra ventas de coches</span>
                </h2>
                <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                    Desbloquea todo el potencial de tu negocio. AutoGest te da el control total para que te centres en lo que realmente importa: vender.
                </p>
                <div className="mt-12 pt-10 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-8 uppercase">Todo incluido en tu plan:</h3>
                    <SubscriptionBenefits />
                </div>
            </div>
            <div className="order-1 lg:order-2 w-full">
                {areCookiesAllowedForPayment ? (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm onSuccessfulPayment={handleSuccessfulPayment} />
                    </Elements>
                ) : (
                    <div className="p-10 bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center text-center">
                        <FontAwesomeIcon icon={faCookieBite} className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 uppercase">Se requiere consentimiento</h3>
                        <p className="text-gray-600 mt-4 mb-8 max-w-sm">
                            Para procesar los pagos de forma segura a través de Stripe, es necesario aceptar el uso de cookies.
                        </p>
                        <button
                            onClick={handleAcceptCookiesForPayment}
                            className="bg-accent text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-accent-hover transition-colors uppercase text-sm"
                        >
                            Aceptar cookies para pagar
                        </button>
                    </div>
                )}
            </div>
            {(isVerifyingPayment || verificationError) && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200 p-8 text-center">
                        {isVerifyingPayment && (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-accent mb-6" />
                                <h3 className="text-xl font-bold text-gray-900 uppercase">Verificando Pago...</h3>
                                <p className="text-gray-600 mt-2">Esto puede tardar unos segundos. No cierres esta ventana.</p>
                            </>
                        )}
                        {verificationError && (
                             <>
                                <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-red-600 mb-6" />
                                <h3 className="text-xl font-bold text-gray-900 uppercase">Error de Verificación</h3>
                                <p className="text-gray-600 mt-2">{verificationError}</p>
                             </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SubscriptionPage = ({ setSubscriptionSuccessModalOpen }) => {
    return (
        <div className="max-w-7xl mx-auto">
            <SubscriptionPageContent setSubscriptionSuccessModalOpen={setSubscriptionSuccessModalOpen} />
        </div>
    );
};

export default SubscriptionPage;