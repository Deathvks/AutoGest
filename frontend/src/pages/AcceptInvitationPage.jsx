// frontend/src/pages/AcceptInvitationPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faSpinner, faSignOutAlt, faUserPlus, faSignInAlt, faUsers } from '@fortawesome/free-solid-svg-icons';

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
                    <div className="text-center py-8">
                        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-accent mb-4" />
                        <p className="text-gray-500 font-medium">Verificando invitación...</p>
                    </div>
                );

            case 'invalid':
            case 'error':
                return (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6 border border-red-100">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-600" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">Error</h2>
                        <p className="text-gray-600 mb-8 px-4">{error}</p>
                        <Link to={user ? "/" : "/login"} className="inline-flex items-center justify-center w-full bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors uppercase text-sm shadow-sm">
                            {user ? "Ir a la página principal" : "Iniciar Sesión"}
                        </Link>
                    </div>
                );

            case 'needsAction':
                if (user && user.email !== invitationDetails.email) {
                    return (
                         <div className="text-center py-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-50 mb-6 border border-yellow-100">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-yellow-600" />
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">Sesión Incorrecta</h2>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left text-sm text-yellow-800 mb-6">
                                <p className="mb-2">
                                    La invitación es para <strong className="font-bold">{invitationDetails.email}</strong>.
                                </p>
                                <p>
                                    Actualmente estás conectado como <strong className="font-bold">{user.email}</strong>.
                                </p>
                            </div>
                             <p className="text-gray-600 text-sm mb-8">
                                Por favor, cierra la sesión actual para poder aceptar la invitación con la cuenta correcta.
                            </p>
                            <button onClick={handleLogout} className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 uppercase text-sm shadow-sm">
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                Cerrar Sesión y Continuar
                            </button>
                        </div>
                    );
                }

                return (
                    <div className="text-center pt-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-6 border border-green-100">
                            <FontAwesomeIcon icon={faUsers} className="text-4xl text-green-600" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 uppercase tracking-tight">Invitación de Equipo</h2>
                        <p className="text-gray-600 mb-6">
                            Has sido invitado a unirte a <span className="font-bold text-gray-900">{invitationDetails.companyName}</span>.
                        </p>
                        
                        {invitationDetails.isTrialActive && (
                            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-left rounded-r-lg">
                                <p className="font-bold text-xs uppercase mb-1">¡Atención!</p>
                                <p className="text-sm leading-relaxed">
                                    Actualmente estás en un período de prueba. Al unirte, tu prueba finalizará. Si abandonas el equipo, necesitarás una suscripción propia.
                                </p>
                            </div>
                        )}

                        {!invitationDetails.isTrialActive && !invitationDetails.hasUsedTrial && (
                            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 text-left rounded-r-lg">
                                <p className="font-bold text-xs uppercase mb-1">Información</p>
                                <p className="text-sm leading-relaxed">
                                    No has usado tu período de prueba. Si en el futuro abandonas este equipo, podrás disfrutar de tus 3 días de prueba.
                                </p>
                            </div>
                        )}

                        {user ? (
                             <button onClick={handleAccept} disabled={isAccepting} className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-70 shadow-sm uppercase text-sm tracking-wide">
                                {isAccepting ? (
                                    <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Uniéndote...</>
                                ) : 'Aceptar y Unirme'}
                            </button>
                        ) : (
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                {invitationDetails.userExists ? (
                                    <>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Hemos detectado una cuenta con el correo <strong className="text-gray-900">{invitationDetails.email}</strong>.
                                        </p>
                                        <Link to={`/login?email=${invitationDetails.email}`} state={{ from: location.pathname }} className="flex w-full items-center justify-center gap-2 bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-hover transition-colors shadow-sm uppercase text-sm">
                                            <FontAwesomeIcon icon={faSignInAlt} />
                                            Iniciar Sesión para Aceptar
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600 mb-4">
                                            No tienes cuenta. Crea una con <strong className="text-gray-900">{invitationDetails.email}</strong> para aceptar.
                                        </p>
                                        <Link to={`/register?email=${invitationDetails.email}`} state={{ from: location.pathname }} className="flex w-full items-center justify-center gap-2 bg-white text-gray-700 font-bold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm uppercase text-sm">
                                            <FontAwesomeIcon icon={faUserPlus} />
                                            Crear Cuenta
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default AcceptInvitationPage;