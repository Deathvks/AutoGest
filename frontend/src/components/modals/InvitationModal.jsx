// autogest-app/frontend/src/components/modals/InvitationModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

const InvitationModal = ({ token, onClose }) => {
    const [invitation, setInvitation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);
    const [error, setError] = useState('');
    // --- INICIO DE LA MODIFICACIÓN ---
    const { refreshUser, setPendingInvitationToken, setPromptTrial } = useContext(AuthContext);
    // --- FIN DE LA MODIFICACIÓN ---

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
            const response = await api.company.acceptInvitation({ token });
            toast.success('¡Te has unido al equipo con éxito!');
            
            handleInvitationHandled(); // Marcar como manejada
            await refreshUser();
            
            // --- INICIO DE LA MODIFICACIÓN ---
            // Oculta el modal de prueba si estaba abierto al aceptar la invitación
            setPromptTrial(false);
            // --- FIN DE LA MODIFICACIÓN ---
            
            setPendingInvitationToken(null);
            onClose();
        } catch (err) {
            toast.error(err.message || 'No se pudo aceptar la invitación.');
            setError(err.message);
            handleInvitationHandled(); // Marcar como manejada incluso si falla la aceptación
        } finally {
            setIsAccepting(false);
        }
    };

    const handleDecline = () => {
        handleInvitationHandled(); // Marcar como manejada
        setPendingInvitationToken(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
            <div className="relative w-full max-w-md p-6 bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl border border-border-color">
                <h2 className="text-2xl font-bold text-center text-text-primary mb-4">
                    Invitación de Equipo
                </h2>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8">
                        <FaSpinner className="animate-spin text-4xl text-accent" />
                        <p className="mt-4 text-text-secondary">Cargando invitación...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="text-center p-4 bg-red-accent/10 rounded-lg border border-red-accent/20">
                        <p className="text-red-accent font-medium">{error}</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-component-bg-hover text-text-primary rounded-lg border border-border-color hover:bg-border-color transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                {invitation && !isLoading && !error && (
                    <div>
                        <p className="text-center text-text-secondary mb-6">
                            Has sido invitado a unirte al equipo{' '}
                            <span className="font-bold text-accent">{invitation.companyName}</span>.
                            {/* --- INICIO DE LA MODIFICACIÓN --- */}
                            {invitation.isTrialActive && (
                                <span className="block mt-3 text-xs text-yellow-accent bg-yellow-accent/10 p-2 rounded-lg border border-yellow-accent/20">
                                    <strong>¡Atención!</strong> Al unirte, tu período de prueba finalizará. Si abandonas el equipo, necesitarás una suscripción.
                                </span>
                            )}
                             {!invitation.isTrialActive && !invitation.hasUsedTrial && (
                                <span className="block mt-3 text-xs text-blue-accent bg-blue-accent/10 p-2 rounded-lg border border-blue-accent/20">
                                    <strong>Nota:</strong> Si en el futuro abandonas el equipo, aún podrás disfrutar de tu prueba gratuita de 3 días.
                                </span>
                            )}
                             {/* --- FIN DE LA MODIFICACIÓN --- */}
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleDecline}
                                disabled={isAccepting}
                                className="px-6 py-2.5 font-semibold text-text-primary bg-component-bg-hover rounded-lg border border-border-color hover:bg-border-color transition-colors disabled:opacity-50"
                            >
                                Rechazar
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={isAccepting}
                                className="px-6 py-2.5 font-semibold text-white bg-accent rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isAccepting ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Aceptando...
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