// autogest-app/frontend/src/pages/AcceptInvitationPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faCheckCircle, faExclamationTriangle, faSpinner, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AcceptInvitationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);

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

    const renderContent = () => {
        if (status === 'verifying' || isLoading) {
            return <div className="text-center text-text-secondary"><FontAwesomeIcon icon={faSpinner} spin size="2x" /></div>;
        }
        if (status === 'error') {
            return (
                <div className="text-center text-red-accent bg-red-accent/10 p-4 rounded-lg">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mb-2 text-2xl" />
                    <p className="font-semibold">{error}</p>
                    <Link to="/login" className="text-sm mt-2 underline hover:opacity-80">Volver a iniciar sesión</Link>
                </div>
            );
        }
        if (status === 'success') {
            return (
                <div className="text-center text-green-accent bg-green-accent/10 p-4 rounded-lg">
                    <FontAwesomeIcon icon={faCheckCircle} className="mb-2 text-2xl" />
                    <p className="font-semibold">{success}</p>
                </div>
            );
        }
        if (status === 'needsLogin' && invitationDetails) {
            return (
                <>
                    <p className="text-center text-sm text-text-secondary">
                        Has sido invitado a unirte a <span className="font-bold text-text-primary">{invitationDetails.companyName}</span>.
                    </p>
                    <p className="text-center text-sm text-text-secondary mt-2">
                        Por favor, inicia sesión en tu cuenta <span className="font-bold text-text-primary">{invitationDetails.email}</span> para aceptar.
                    </p>
                    <div className="mt-8">
                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                        <button 
                            onClick={handleLogin} 
                            className="group relative flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                        >
                            <FontAwesomeIcon icon={faSignInAlt} />
                            <span>Iniciar Sesión para Aceptar</span>
                        </button>
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                    </div>
                </>
            );
        }
        if (status === 'readyToAccept' && invitationDetails) {
            return (
                <>
                    <p className="text-center text-sm text-text-secondary">
                        Estás a punto de unirte a <span className="font-bold text-text-primary">{invitationDetails.companyName}</span> con tu cuenta <span className="font-bold text-text-primary">{invitationDetails.email}</span>.
                    </p>
                    <div className="mt-8">
                        <button onClick={handleAccept} disabled={isLoading} className="group relative flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50">
                            {isLoading ? 'UNIENDO...' : 'Confirmar y Unirme al Equipo'}
                        </button>
                    </div>
                </>
            );
        }
        return null;
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-[90%] sm:w-full max-w-md space-y-8 rounded-xl bg-component-bg p-8 sm:p-10 shadow-lg border border-border-color">
                <div className="mx-auto flex h-12 w-auto items-center justify-center text-accent">
                    <FontAwesomeIcon icon={faCar} className="h-10 w-10" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
                    Únete a tu equipo
                </h2>
                {renderContent()}
            </div>
        </div>
    );
};

export default AcceptInvitationPage;