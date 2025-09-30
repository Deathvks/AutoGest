// autogest-app/frontend/src/pages/SubscriptionPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner, faExclamationTriangle, faUsersCog } from '@fortawesome/free-solid-svg-icons';

import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Importa los componentes refactorizados
import SubscriptionBenefits from './Subscription/SubscriptionBenefits';
import CheckoutForm from './Subscription/CheckoutForm';
import SubscriptionStatus from './Subscription/SubscriptionStatus';

const stripePublishableKey = import.meta.env.PROD 
    ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE 
    : import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST;

const stripePromise = loadStripe(stripePublishableKey);

const SubscriptionPageContent = ({ setSubscriptionSuccessModalOpen }) => {
    const { user, subscriptionStatus, refreshSubscriptionStatus } = useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(true);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    const handleSuccessfulPayment = () => {
        console.log('[Payment] Pago exitoso. Iniciando verificación...');
        setIsVerifyingPayment(true);
        setVerificationError('');

        let attempts = 0;
        const maxAttempts = 12;
        const pollIntervals = [1000, 2000, 2000, 3000, 3000, 3000, 4000, 4000, 5000, 5000, 5000, 5000];

        const pollForStatus = async () => {
            if (attempts >= maxAttempts) {
                try {
                    await api.syncSubscription();
                    const freshUser = await api.getMe();
                    if (freshUser.subscriptionStatus === 'active') {
                        await refreshSubscriptionStatus();
                        setSubscriptionSuccessModalOpen(true);
                        setIsVerifyingPayment(false);
                        return;
                    }
                } catch (syncError) {
                    console.error('[Sync] Error en sincronización manual:', syncError);
                }

                setVerificationError("La verificación tardó más de lo esperado. Recarga la página en unos momentos.");
                setIsVerifyingPayment(false);
                return;
            }

            try {
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

    useEffect(() => {
        if (user) {
            setIsLoading(false);
        }
    }, [user]);

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se añade 'technician' a los roles que no requieren suscripción de pago.
    if (user.role === 'admin' || user.role === 'technician') {
    // --- FIN DE LA MODIFICACIÓN ---
        return (
            <div className="p-8 bg-component-bg rounded-xl border border-border-color text-center animated-premium-background">
                <FontAwesomeIcon icon={faCheckCircle} className="w-16 h-16 mx-auto mb-4 text-green-accent" />
                <h3 className="text-xl font-bold text-green-accent">CUENTA DE ACCESO COMPLETO</h3>
                <p className="text-text-secondary mt-2">TU ROL DE {user.role.toUpperCase()} NO REQUIERE UNA SUSCRIPCIÓN DE PAGO.</p>
            </div>
        );
    }
    
    if (user.role === 'user' && user.companyId) {
        return (
            <div className="p-8 bg-component-bg rounded-xl border border-border-color text-center animated-premium-background">
                <FontAwesomeIcon icon={faUsersCog} className="w-16 h-16 mx-auto mb-4 text-blue-accent" />
                <h3 className="text-xl font-bold text-blue-accent">SUSCRIPCIÓN GESTIONADA</h3>
                <p className="text-text-secondary mt-2">
                    LA SUSCRIPCIÓN DE ESTA CUENTA ES GESTIONADA POR LA ORGANIZACIÓN A LA QUE PERTENECES.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return <div className="text-center p-8"><FontAwesomeIcon icon={faSpinner} spin size="2x" /></div>;
    }

    const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'cancelled';
    
    if (isSubscribed) {
        return (
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-text-primary tracking-tight">Tu Suscripción</h1>
                    <p className="mt-2 text-lg text-text-secondary">Gestiona el estado de tu plan y revisa los beneficios incluidos.</p>
                </div>
                <SubscriptionStatus status={subscriptionStatus} expiry={user.subscriptionExpiry} onCancel={handleCancel} />
                <div>
                    <h2 className="text-2xl font-semibold text-text-primary mb-6">Beneficios de tu Plan</h2>
                    <SubscriptionBenefits />
                </div>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="lg:pt-8 animate-fade-in-up">
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
                {isVerifyingPayment ? (
                    <div className="p-8 bg-component-bg rounded-xl border border-border-color shadow-lg h-full flex flex-col items-center justify-center">
                        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-accent mb-4" />
                        <h3 className="text-xl font-bold text-text-primary">VERIFICANDO PAGO...</h3>
                        <p className="text-text-secondary mt-2 text-center">ESTO PUEDE TARDAR UNOS SEGUNDOS. NO CIERRES ESTA VENTANA.</p>
                    </div>
                ) : verificationError ? (
                    <div className="p-8 bg-component-bg rounded-xl border border-border-color shadow-lg h-full flex flex-col items-center justify-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-red-accent mb-4" />
                        <h3 className="text-xl font-bold text-text-primary">ERROR DE VERIFICACIÓN</h3>
                        <p className="text-text-secondary mt-2 text-center">{verificationError}</p>
                    </div>
                ) : (
                    <CheckoutForm onSuccessfulPayment={handleSuccessfulPayment} />
                )}
            </div>
        </div>
    );
};

const SubscriptionPage = ({ setSubscriptionSuccessModalOpen }) => {
    return (
        <div className="max-w-7xl mx-auto">
            <Elements stripe={stripePromise}>
                <SubscriptionPageContent setSubscriptionSuccessModalOpen={setSubscriptionSuccessModalOpen} />
            </Elements>
        </div>
    );
};

export default SubscriptionPage;