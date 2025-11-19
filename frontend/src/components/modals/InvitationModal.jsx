// autogest-app/frontend/src/components/modals/InvitationModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const InvitationModal = ({ token, onClose }) => {
    const [invitation, setInvitation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);
    const [error, setError] = useState('');
    const { setPendingInvitationToken, setPromptTrial } = useContext(AuthContext);

    const handleInvitationHandled = () => {
        const handledTokens = JSON.parse(localStorage.getItem('handledInvitationTokens') || '[]');
        if (!handledTokens.includes(token)) {
            handledTokens.push(token);
            localStorage.setItem('handledInvitationTokens', JSON.stringify(handledTokens));
        }
    };

    useEffect(() => {
        const verifyInvitation = async () => {
            try {
                setIsLoading(true);
                const data = await api.company.verifyInvitation(token);
                setInvitation(data);
            } catch (err) {
                setError(err.message || 'La invitación es inválida o ha expirado.');
                toast.error(err.message || 'La invitación es inválida o ha expirado.');
                handleInvitationHandled(); // Marcar como manejada incluso si hay error
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            verifyInvitation();
        }
    }, [token]);

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            await api.company.acceptInvitation({ token });
            toast.success('¡Te has unido al equipo con éxito!');
            
            handleInvitationHandled();
            
            // Forzamos una recarga completa
            window.location.href = '/';

        } catch (err) {
            toast.error(err.message || 'No se pudo aceptar la invitación.');
            setError(err.message);
            handleInvitationHandled();
        } finally {
            setIsAccepting(false);
        }
    };

    const handleDecline = () => {
        handleInvitationHandled();
        setPendingInvitationToken(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
            <div className="relative w-full max-w-md p-8 bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4 border border-green-100">
                        <FontAwesomeIcon icon={faUsers} className="text-3xl text-green-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">
                        Invitación de Equipo
                    </h2>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-4">
                        <FaSpinner className="animate-spin text-4xl text-accent" />
                        <p className="mt-4 text-gray-500 font-medium">Cargando invitación...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-2xl mb-2" />
                        <p className="text-red-700 font-medium">{error}</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-bold text-sm uppercase shadow-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                {invitation && !isLoading && !error && (
                    <div>
                        <p className="text-center text-gray-600 mb-6">
                            Has sido invitado a unirte al equipo <br/>
                            <span className="font-extrabold text-gray-900 text-lg">{invitation.companyName}</span>
                        </p>
                        
                        {invitation.isTrialActive && (
                            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-left rounded-r text-sm">
                                <div className="flex items-center gap-2 mb-1 font-bold uppercase">
                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                    <span>¡Atención!</span>
                                </div>
                                <p>Al unirte, tu período de prueba finalizará. Si abandonas el equipo, necesitarás una suscripción.</p>
                            </div>
                        )}

                         {!invitation.isTrialActive && !invitation.hasUsedTrial && (
                            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 text-left rounded-r text-sm">
                                <div className="flex items-center gap-2 mb-1 font-bold uppercase">
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    <span>Información</span>
                                </div>
                                <p>No has usado tu período de prueba. Si en el futuro abandonas este equipo, podrás disfrutar de tus 3 días de prueba.</p>
                            </div>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleDecline}
                                disabled={isAccepting}
                                className="w-full sm:w-auto px-6 py-2.5 font-bold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 uppercase text-xs tracking-wide shadow-sm"
                            >
                                Rechazar
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={isAccepting}
                                className="w-full sm:w-auto px-6 py-2.5 font-bold text-white bg-accent rounded-lg shadow hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center uppercase text-xs tracking-wide"
                            >
                                {isAccepting ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Uniéndote...
                                    </>
                                ) : (
                                    'Aceptar Invitación'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitationModal;