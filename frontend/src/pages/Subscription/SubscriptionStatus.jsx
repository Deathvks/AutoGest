// autogest-app/frontend/src/pages/Subscription/SubscriptionStatus.jsx
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faTimesCircle, faSpinner, faUndo, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import CancelSubscriptionModal from '../../components/modals/CancelSubscriptionModal';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const SubscriptionStatus = ({ status, expiry, onCancel }) => {
    const { refreshSubscriptionStatus } = useContext(AuthContext);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [isReactivating, setIsReactivating] = useState(false); 
    const [reactivateError, setReactivateError] = useState('');
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [portalError, setPortalError] = useState('');

    const handleManageSubscription = async () => {
        setIsPortalLoading(true);
        setPortalError('');
        try {
            const response = await api.subscriptions.createCustomerPortalSession();
            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            setPortalError(error.message || 'No se pudo abrir el portal de gestión. Inténtalo de nuevo.');
            setTimeout(() => setPortalError(''), 5000);
        } finally {
            setIsPortalLoading(false);
        }
    };

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

    const handleReactivate = async () => {
        setIsReactivating(true);
        setReactivateError('');
        try {
            await api.subscriptions.reactivateSubscription();
            await refreshSubscriptionStatus();
        } catch (error) {
            setReactivateError(error.message || 'No se pudo reactivar la suscripción.');
            setTimeout(() => setReactivateError(''), 5000);
        } finally {
            setIsReactivating(false);
        }
    };

    const statusInfo = {
        active: { icon: faCheckCircle, color: 'text-green-600', title: 'SUSCRIPCIÓN ACTIVA', message: `GRACIAS POR FORMAR PARTE DE AUTOGEST. TU PLAN SE RENOVARÁ EL ${new Date(expiry).toLocaleDateString()}.` },
        cancelled: { icon: faTimesCircle, color: 'text-yellow-600', title: 'SUSCRIPCIÓN CANCELADA', message: `TU ACCESO PERMANECERÁ ACTIVO HASTA EL ${new Date(expiry).toLocaleDateString()}.` },
        past_due: { icon: faExclamationTriangle, color: 'text-red-600', title: 'PAGO PENDIENTE', message: 'NO SE PUDO PROCESAR TU PAGO. POR FAVOR, ACTUALIZA TU MÉTODO DE PAGO.' },
        inactive: { icon: faExclamationTriangle, color: 'text-red-600', title: 'SUSCRIPCIÓN INACTIVA', message: 'TU SUSCRIPCIÓN HA TERMINADO. RENUÉVALA PARA CONTINUAR.' },
    };

    const currentStatus = statusInfo[status] || statusInfo.inactive;

    return (
        <>
            <div className="relative p-8 bg-white rounded-lg border border-gray-200 shadow-sm text-center h-full flex flex-col justify-center overflow-hidden">
                {/* Franja decorativa superior */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent"></div>

                <FontAwesomeIcon 
                    icon={currentStatus.icon} 
                    className={`w-16 h-16 mx-auto mb-4 ${currentStatus.color} animate-fade-in-up`} 
                />
                <h3 
                    className={`text-xl font-bold text-gray-900 animate-fade-in-up`}
                    style={{ animationDelay: '150ms' }}
                >
                    {currentStatus.title}
                </h3>
                <p 
                    className="text-gray-600 mt-2 animate-fade-in-up"
                    style={{ animationDelay: '300ms' }}
                >
                    {currentStatus.message}
                </p>
                <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                    {status === 'active' && (
                        <>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={isPortalLoading}
                                    className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-6 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase text-sm"
                                >
                                    {isPortalLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faCreditCard} /> Gestionar Suscripción</>}
                                </button>
                                <button
                                    onClick={handleCancelClick}
                                    disabled={isCancelling}
                                    className="w-full sm:w-auto bg-white border border-red-200 text-red-600 font-bold py-2.5 px-6 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 uppercase text-sm"
                                >
                                    {isCancelling ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Cancelar Suscripción'}
                                </button>
                            </div>
                            {cancelError && <p className="text-red-600 text-sm mt-3 font-semibold">{cancelError}</p>}
                            {portalError && <p className="text-red-600 text-sm mt-3 font-semibold">{portalError}</p>}
                        </>
                    )}
                    {status === 'cancelled' && (
                         <>
                             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={isPortalLoading}
                                    className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-6 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase text-sm"
                                >
                                    {isPortalLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faCreditCard} /> Gestionar Suscripción</>}
                                </button>
                                <button
                                    onClick={handleReactivate}
                                    disabled={isReactivating}
                                    className="w-full sm:w-auto bg-accent text-white font-bold py-2.5 px-6 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase text-sm shadow-lg shadow-accent/20"
                                >
                                    {isReactivating ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faUndo} /> Reactivar Suscripción</>}
                                </button>
                            </div>
                            {reactivateError && <p className="text-red-600 text-sm mt-3 font-semibold">{reactivateError}</p>}
                            {portalError && <p className="text-red-600 text-sm mt-3 font-semibold">{portalError}</p>}
                        </>
                    )}
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