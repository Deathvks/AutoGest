// frontend/src/pages/AcceptInvitationPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const AcceptInvitationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user, login } = useContext(AuthContext);

    const [invitationDetails, setInvitationDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await api.verifyInvitation(token);
                setInvitationDetails(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'El enlace de invitación es inválido o ha expirado.');
            } finally {
                setIsLoading(false);
            }
        };
        verifyToken();
    }, [token]);

    const handleAccept = async () => {
        setIsAccepting(true);
        setError('');
        try {
            const response = await api.acceptInvitation({ token });
            if(user) {
                // Si el usuario ya está logueado, actualizamos su estado en el contexto
                login(response.data.user, localStorage.getItem('token'));
            }
            navigate('/dashboard?invitation_accepted=true');
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo aceptar la invitación.');
        } finally {
            setIsAccepting(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-page-bg-color text-text-primary">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg-color flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-component-bg shadow-lg rounded-xl p-8 border border-border-color">
                {error ? (
                    <div className="text-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-text-primary mb-2">Error en la Invitación</h2>
                        <p className="text-text-secondary">{error}</p>
                        <Link to={user ? "/dashboard" : "/login"} className="mt-6 inline-block bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors">
                            {user ? "Ir al Dashboard" : "Iniciar Sesión"}
                        </Link>
                    </div>
                ) : (
                    <div className="text-center">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-text-primary mb-2">Has sido invitado</h2>
                        <p className="text-text-secondary">
                            Has recibido una invitación para unirte al equipo de <span className="font-semibold">{invitationDetails.companyName}</span>.
                        </p>
                        
                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                        {invitationDetails.isTrialActive && (
                            <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
                                <p className="font-bold">¡Atención!</p>
                                <p>Actualmente estás disfrutando de un período de prueba. Al unirte a este equipo, tu prueba finalizará. Si abandonas el equipo, necesitarás una suscripción para continuar usando el servicio.</p>
                            </div>
                        )}

                        {!invitationDetails.isTrialActive && !invitationDetails.hasUsedTrial && (
                            <div className="mt-4 p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-md">
                                <p className="font-bold">Información</p>
                                <p>No has utilizado tu período de prueba. Si en el futuro abandonas este equipo, todavía podrás disfrutar de tus 3 días de prueba gratuitos.</p>
                            </div>
                        )}
                        {/* --- FIN DE LA MODIFICACIÓN --- */}

                        {user ? (
                             <button onClick={handleAccept} disabled={isAccepting} className="mt-8 w-full bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50">
                                {isAccepting ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                        Uniéndote...
                                    </>
                                ) : 'Aceptar y Unirme al Equipo'}
                            </button>
                        ) : (
                            <div className="mt-8">
                                <p className="text-text-secondary mb-4">Para aceptar, por favor, inicia sesión o crea una cuenta con el correo <span className='font-bold'>{invitationDetails.email}</span>.</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link to={`/login?email=${invitationDetails.email}`} className="flex-1 bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover text-center transition-colors">
                                        Iniciar Sesión
                                    </Link>
                                    <Link to={`/register?email=${invitationDetails.email}`} className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 text-center transition-colors">
                                        Registrarse
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcceptInvitationPage;