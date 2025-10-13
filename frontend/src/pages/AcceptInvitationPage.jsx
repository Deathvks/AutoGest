// autogest-app/frontend/src/pages/AcceptInvitationPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faCheckCircle, faExclamationTriangle, faSpinner, faSignInAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AcceptInvitationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);

    const [invitationDetails, setInvitationDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [status, setStatus] = useState('verifying'); // 'verifying', 'needsLogin', 'readyToAccept', 'error', 'success'

    useEffect(() => {
        const verifyAndCheckAuth = async () => {
            setIsLoading(true);
            setError('');
            setStatus('verifying');
            try {
                const details = await api.company.verifyInvitation(token);
                setInvitationDetails(details);

                if (!user) {
                    setStatus('needsLogin');
                } else if (user.email.toLowerCase() !== details.email.toLowerCase()) {
                    setError(`Esta invitación es para ${details.email}. Por favor, cierra sesión e inicia sesión con la cuenta correcta.`);
                    setStatus('error');
                } else {
                    setStatus('readyToAccept');
                }
            } catch (err) {
                setError(err.message || 'El enlace de invitación es inválido o ha expirado.');
                setStatus('error');
            } finally {
                setIsLoading(false);
            }
        };
        verifyAndCheckAuth();
    }, [token, user]);

    const handleAccept = async () => {
        setError('');
        setIsLoading(true);
        try {
            const response = await api.company.acceptInvitation({ token });
            setSuccess(response.message || '¡Te has unido al equipo! Serás redirigido a la aplicación.');
            setStatus('success');
            setTimeout(() => {
                navigate('/cars');
                window.location.reload();
            }, 3000);
        } catch (err) {
            setError(err.message || 'No se pudo completar la acción.');
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogin = () => {
        navigate('/login', { state: { from: location } });
    };

    const handleLogoutAndSetRedirect = () => {
        localStorage.setItem('loginRedirect', location.pathname);
        logout();
    };

    const renderContent = () => {
        if (status === 'verifying' || isLoading) {
            return <div className="text-center text-text-secondary"><FontAwesomeIcon icon={faSpinner} spin size="2x" /></div>;
        }
        if (status === 'error') {
            const isWrongUserError = error.includes('cierra sesión');
            return (
                // --- INICIO DE LA MODIFICACIÓN ---
                <div className="text-center text-red-accent bg-red-accent/10 p-4 rounded-xl">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mb-2 text-3xl" />
                    <p className="font-semibold">{error}</p>
                    <div className="mt-4">
                        {isWrongUserError ? (
                            <button
                                onClick={handleLogoutAndSetRedirect}
                                className="w-full bg-accent text-white font-semibold px-4 py-3 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-colors"
                            >
                                Cerrar sesión para continuar
                            </button>
                        ) : (
                            <Link to="/login" className="inline-block w-full bg-accent text-white font-semibold px-4 py-3 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-colors">
                                Ir a Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>
            );
        }
        if (status === 'success') {
            return (
                // --- INICIO DE LA MODIFICACIÓN ---
                <div className="text-center text-green-accent bg-green-accent/10 p-4 rounded-xl">
                    <FontAwesomeIcon icon={faCheckCircle} className="mb-2 text-3xl" />
                    <p className="font-semibold">{success}</p>
                </div>
            );
        }
        if (status === 'needsLogin' && invitationDetails) {
            return (
                <>
                    <p className="text-center text-text-secondary">
                        Has sido invitado a unirte a <span className="font-bold text-text-primary">{invitationDetails.companyName}</span>.
                    </p>
                    <p className="text-center text-text-secondary mt-2">
                        Por favor, inicia sesión en tu cuenta <span className="font-bold text-text-primary">{invitationDetails.email}</span> para aceptar.
                    </p>
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <div className="mt-6">
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                        <button 
                            onClick={handleLogin} 
                            className="w-full flex items-center justify-center gap-2 rounded-lg border border-transparent bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                        >
                            <FontAwesomeIcon icon={faSignInAlt} />
                            <span>Iniciar Sesión para Aceptar</span>
                        </button>
                    </div>
                </>
            );
        }
        if (status === 'readyToAccept' && invitationDetails) {
            return (
                <>
                    <p className="text-center text-text-secondary">
                        Estás a punto de unirte a <span className="font-bold text-text-primary">{invitationDetails.companyName}</span> con tu cuenta <span className="font-bold text-text-primary">{invitationDetails.email}</span>.
                    </p>
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <div className="mt-6">
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                        <button onClick={handleAccept} disabled={isLoading} className="w-full flex items-center justify-center gap-2 rounded-lg border border-transparent bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50">
                            {isLoading ? <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> UNIENDO...</> : 'Confirmar y Unirme al Equipo'}
                        </button>
                    </div>
                </>
            );
        }
        return null;
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(var(--color-accent)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-component-bg p-8 shadow-2xl backdrop-blur-lg border border-border-color">
                <div className="text-center">
                    <FontAwesomeIcon icon={faUsers} className="mx-auto h-12 w-auto text-accent" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-text-primary">
                        Únete a tu Equipo
                    </h2>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default AcceptInvitationPage;