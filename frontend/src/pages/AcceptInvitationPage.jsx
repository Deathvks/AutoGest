// frontend/src/pages/AcceptInvitationPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faSpinner, faSignOutAlt, faUserPlus, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const AcceptInvitationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login, logout } = useContext(AuthContext);

    const [invitationDetails, setInvitationDetails] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, needsAction, invalid, error
    const [error, setError] = useState('');
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await api.company.verifyInvitation(token);
                setInvitationDetails(response.data);
                setStatus('needsAction');
                if (!user) {
                    localStorage.setItem('pendingInvitation', JSON.stringify({
                        token: token,
                        email: response.data.email
                    }));
                }
            } catch (err) {
                setError(err.response?.data?.error || 'El enlace de invitación es inválido o ha expirado.');
                setStatus('invalid');
            }
        };
        verifyToken();
    }, [token, user]);

    const handleAccept = async () => {
        setIsAccepting(true);
        setError('');
        try {
            const response = await api.company.acceptInvitation({ token });
            if (user) {
                login(response.data.user, localStorage.getItem('authToken'));
            }
            navigate('/?invitation_accepted=true');
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo aceptar la invitación.');
            setStatus('error');
        } finally {
            setIsAccepting(false);
        }
    };
    
    const handleLogout = async () => {
        await logout();
        window.location.reload();
    };

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="text-center">
                        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-accent mb-4" />
                        <p className="text-text-secondary">Verificando invitación...</p>
                    </div>
                );

            case 'invalid':
            case 'error':
                return (
                    <div className="text-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl text-red-accent mb-4" />
                        <h2 className="text-2xl font-bold text-text-primary mb-2">Error en la Invitación</h2>
                        <p className="text-text-secondary">{error}</p>
                        <Link to={user ? "/" : "/login"} className="mt-6 inline-block bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors">
                            {user ? "Ir a la página principal" : "Iniciar Sesión"}
                        </Link>
                    </div>
                );

            case 'needsAction':
                if (user && user.email !== invitationDetails.email) {
                    return (
                         <div className="text-center">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl text-yellow-accent mb-4" />
                            <h2 className="text-2xl font-bold text-text-primary mb-2">Sesión Incorrecta</h2>
                            <p className="text-text-secondary">
                                La invitación es para <strong className="font-semibold text-text-primary">{invitationDetails.email}</strong>, pero has iniciado sesión como <strong className="font-semibold text-text-primary">{user.email}</strong>.
                            </p>
                             <p className="text-text-secondary mt-2">
                                Por favor, cierra la sesión actual para poder aceptar la invitación.
                            </p>
                            <button onClick={handleLogout} className="mt-8 w-full bg-red-accent/20 text-red-accent font-bold py-3 px-4 rounded-lg hover:bg-red-accent/30 transition-colors flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                Cerrar Sesión y Continuar
                            </button>
                        </div>
                    );
                }

                return (
                    <div className="text-center">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-accent mb-4" />
                        <h2 className="text-2xl font-bold text-text-primary mb-2">Has sido invitado</h2>
                        <p className="text-text-secondary">
                            Para unirte al equipo de <span className="font-semibold text-text-primary">{invitationDetails.companyName}</span>.
                        </p>
                        
                        {invitationDetails.isTrialActive && (
                            <div className="mt-4 p-3 bg-yellow-accent/10 border-l-4 border-yellow-accent text-yellow-accent/80 rounded-md text-left">
                                <p className="font-bold">¡Atención!</p>
                                <p className="text-sm">Actualmente estás en un período de prueba. Al unirte, tu prueba finalizará. Si abandonas el equipo, necesitarás una suscripción.</p>
                            </div>
                        )}

                        {!invitationDetails.isTrialActive && !invitationDetails.hasUsedTrial && (
                            // --- INICIO DE LA MODIFICACIÓN ---
                            // Eliminamos la clase 'border' para quitar el borde blanco
                            <div className="mt-4 p-3 bg-blue-accent/10 border-l-4 border-blue-accent text-blue-accent/80 rounded-md text-left">
                            {/* --- FIN DE LA MODIFICACIÓN --- */}
                                <p className="font-bold">Información</p>
                                <p className="text-sm">No has usado tu período de prueba. Si en el futuro abandonas este equipo, podrás disfrutar de tus 3 días de prueba.</p>
                            </div>
                        )}

                        {user ? (
                             <button onClick={handleAccept} disabled={isAccepting} className="mt-8 w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50">
                                {isAccepting ? (
                                    <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Uniéndote...</>
                                ) : 'Aceptar y Unirme al Equipo'}
                            </button>
                        ) : (
                            <div className="mt-8">
                                {invitationDetails.userExists ? (
                                    <p className="text-text-secondary mb-4">
                                        Hemos detectado una cuenta con el correo <strong className="font-semibold text-text-primary">{invitationDetails.email}</strong>. Por favor, inicia sesión para aceptar la invitación.
                                    </p>
                                ) : (
                                    <p className="text-text-secondary mb-4">
                                        Parece que no tienes una cuenta. Para aceptar la invitación, primero <strong className="font-semibold text-text-primary">debes crear una cuenta</strong> con el correo <strong className="font-semibold text-text-primary">{invitationDetails.email}</strong>.
                                    </p>
                                )}
                                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                    {invitationDetails.userExists ? (
                                        <Link to={`/login?email=${invitationDetails.email}`} state={{ from: location.pathname }} className="flex-1 bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-hover text-center transition-colors flex items-center justify-center gap-2">
                                            <FontAwesomeIcon icon={faSignInAlt} />
                                            Iniciar Sesión
                                        </Link>
                                    ) : (
                                        <Link to={`/register?email=${invitationDetails.email}`} state={{ from: location.pathname }} className="flex-1 bg-component-bg-hover text-text-primary font-bold py-3 px-4 rounded-lg hover:bg-border-color text-center transition-colors flex items-center justify-center gap-2">
                                            <FontAwesomeIcon icon={faUserPlus} />
                                            Crear Cuenta
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(var(--color-accent)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-component-bg p-8 shadow-2xl backdrop-blur-lg border border-border-color">
                {renderContent()}
            </div>
        </div>
    );
};

export default AcceptInvitationPage;