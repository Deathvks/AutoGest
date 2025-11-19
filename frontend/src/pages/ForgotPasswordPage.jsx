// autogest-app/frontend/src/pages/ForgotPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faEnvelope, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const InputField = ({ name, type, value, onChange, placeholder, icon }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={icon} className="text-gray-400" />
        </div>
        <input 
            id={name} 
            name={name} 
            type={type} 
            value={value} 
            onChange={onChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-colors"
            placeholder={placeholder} 
        />
    </div>
);

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await api.forgotPassword({ email });
            setMessage(response.message);
            setResendCooldown(15);
        } catch (err) {
            setError(err.message || 'Error al procesar la solicitud.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            {/* Fondo coincidente con Login/Register */}
            <div className="absolute inset-0 -z-10 bg-background"></div>
            
            <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4 text-accent border border-red-100">
                        <FontAwesomeIcon icon={faCar} className="h-8 w-8" />
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
                        Recuperar Contraseña
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Introduce tu email y te enviaremos un enlace para restablecerla.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <InputField 
                            name="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Correo electrónico" 
                            icon={faEnvelope} 
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-100">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-bold text-red-800 uppercase">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {message && (
                         <div className="rounded-md bg-green-50 p-4 border border-green-100">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-bold text-green-800 uppercase">Enviado</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>{message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button 
                            type="submit" 
                            disabled={isLoading || resendCooldown > 0}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide shadow-md"
                        >
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : (resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Enviar Enlace')}
                        </button>
                    </div>
                </form>
                
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        ¿Lo has recordado?{' '}
                        <Link to="/login" className="font-bold text-accent hover:text-accent-hover transition-colors">
                            Volver a Iniciar Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;