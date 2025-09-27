// autogest-app/frontend/src/pages/Subscription/SubscriptionStatus.jsx
import React, { useState, useContext } from 'react'; // --- INICIO DE LA MODIFICACIÓN ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faTimesCircle, faSpinner, faUndo } from '@fortawesome/free-solid-svg-icons';
import CancelSubscriptionModal from '../../components/modals/CancelSubscriptionModal';
import api from '../../services/api'; // --- INICIO DE LA MODIFICACIÓN ---
import { AuthContext } from '../../context/AuthContext'; // --- INICIO DE LA MODIFICACIÓN ---

const SubscriptionStatus = ({ status, expiry, onCancel }) => {
    const { refreshSubscriptionStatus } = useContext(AuthContext); // --- INICIO DE LA MODIFICACIÓN ---
    const [isCancelling, setIsCancelling] = useState(false);
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelError, setCancelError] = useState('');
    // --- INICIO DE LA MODIFICACIÓN ---
    const [isReactivating, setIsReactivating] = useState(false); 
    const [reactivateError, setReactivateError] = useState('');
    // --- FIN DE LA MODIFICACIÓN ---

    const handleCancelClick = () => {
        setCancelError('');
        setCancelModalOpen(true);
    };

    const confirmCancellation = async () => {
        setCancelModalOpen(false);
        setIsCancelling(true);
        setCancelError('');
        try {
            await onCancel();
        } catch (error) {
            setCancelError(error.message || 'No se pudo cancelar la suscripción. Inténtalo de nuevo.');
            setTimeout(() => setCancelError(''), 5000);
        } finally {
            setIsCancelling(false);
        }
    };

    // --- INICIO DE LA MODIFICACIÓN ---
    const handleReactivate = async () => {
        setIsReactivating(true);
        setReactivateError('');
        try {
            await api.subscriptions.reactivateSubscription();
            await refreshSubscriptionStatus(); // Refresca el estado para que la UI se actualice
        } catch (error) {
            setReactivateError(error.message || 'No se pudo reactivar la suscripción.');
            setTimeout(() => setReactivateError(''), 5000);
        } finally {
            setIsReactivating(false);
        }
    };
    // --- FIN DE LA MODIFICACIÓN ---

    const statusInfo = {
        active: { icon: faCheckCircle, color: 'text-green-accent', title: 'SUSCRIPCIÓN ACTIVA', message: `GRACIAS POR FORMAR PARTE DE AUTOGEST. TU PLAN SE RENOVARÁ EL ${new Date(expiry).toLocaleDateString()}.` },
        cancelled: { icon: faTimesCircle, color: 'text-yellow-accent', title: 'SUSCRIPCIÓN CANCELADA', message: `TU ACCESO PERMANECERÁ ACTIVO HASTA EL ${new Date(expiry).toLocaleDateString()}.` },
        past_due: { icon: faExclamationTriangle, color: 'text-red-accent', title: 'PAGO PENDIENTE', message: 'NO SE PUDO PROCESAR TU PAGO. POR FAVOR, ACTUALIZA TU MÉTODO DE PAGO.' },
        inactive: { icon: faExclamationTriangle, color: 'text-red-accent', title: 'SUSCRIPCIÓN INACTIVA', message: 'TU SUSCRIPCIÓN HA TERMINADO. RENUÉVALA PARA CONTINUAR.' },
    };

    const currentStatus = statusInfo[status] || statusInfo.inactive;

    return (
        <>
            <div className="p-8 bg-component-bg rounded-xl border border-border-color shadow-lg text-center h-full flex flex-col justify-center animated-premium-background">
                <FontAwesomeIcon 
                    icon={currentStatus.icon} 
                    className={`w-16 h-16 mx-auto mb-4 ${currentStatus.color} animate-fade-in-up`} 
                />
                <h3 
                    className={`text-xl font-bold ${currentStatus.color} animate-fade-in-up`}
                    style={{ animationDelay: '150ms', opacity: 0 }}
                >
                    {currentStatus.title}
                </h3>
                <p 
                    className="text-text-secondary mt-2 animate-fade-in-up"
                    style={{ animationDelay: '300ms', opacity: 0 }}
                >
                    {currentStatus.message}
                </p>
                <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '450ms', opacity: 0 }}>
                    {status === 'active' && (
                        <>
                            <button
                                onClick={handleCancelClick}
                                disabled={isCancelling}
                                className="bg-red-accent/10 text-red-accent font-semibold py-2 px-6 rounded-lg hover:bg-red-accent/20 transition-colors disabled:opacity-50"
                            >
                                {isCancelling ? <FontAwesomeIcon icon={faSpinner} spin /> : 'CANCELAR SUSCRIPCIÓN'}
                            </button>
                            {cancelError && (
                                <p className="text-red-accent text-sm mt-3">{cancelError}</p>
                            )}
                        </>
                    )}
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    {status === 'cancelled' && (
                         <>
                            <button
                                onClick={handleReactivate}
                                disabled={isReactivating}
                                className="bg-green-accent/10 text-green-accent font-semibold py-2 px-6 rounded-lg hover:bg-green-accent/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                            >
                                {isReactivating ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faUndo} /> REACTIVAR SUSCRIPCIÓN</>}
                            </button>
                            {reactivateError && (
                                <p className="text-red-accent text-sm mt-3">{reactivateError}</p>
                            )}
                        </>
                    )}
                     {/* --- FIN DE LA MODIFICACIÓN --- */}
                </div>
            </div>
            <CancelSubscriptionModal 
                isOpen={isCancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={confirmCancellation}
            />
        </>
    );
};

export default SubscriptionStatus;