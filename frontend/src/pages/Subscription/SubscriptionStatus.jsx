// autogest-app/frontend/src/pages/Subscription/SubscriptionStatus.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

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
        <div className="p-8 bg-component-bg rounded-xl border border-border-color shadow-lg text-center h-full flex flex-col justify-center animated-premium-background">
            <FontAwesomeIcon 
                icon={currentStatus.icon} 
                className={`w-16 h-16 mx-auto mb-4 ${currentStatus.color} animate-fade-in-up`} 
            />
            <h3 
                className={`text-xl font-bold ${currentStatus.color} animate-fade-in-up`}
                style={{ animationDelay: '150ms' }}
            >
                {currentStatus.title}
            </h3>
            <p 
                className="text-text-secondary mt-2 animate-fade-in-up"
                style={{ animationDelay: '300ms' }}
            >
                {currentStatus.message}
            </p>
            {status === 'active' && (
                 <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="mt-6 bg-red-accent/10 text-red-accent font-semibold py-2 px-6 rounded-lg hover:bg-red-accent/20 transition-colors disabled:opacity-50 animate-fade-in-up"
                    style={{ animationDelay: '450ms' }}
                >
                    {isCancelling ? <FontAwesomeIcon icon={faSpinner} spin /> : 'CANCELAR SUSCRIPCIÓN'}
                </button>
            )}
        </div>
    );
};

export default SubscriptionStatus;