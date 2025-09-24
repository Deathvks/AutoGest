// autogest-app/frontend/src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const InputField = ({ name, type, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="sr-only">{placeholder}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-text-secondary" />
            </div>
            <input 
                id={name} name={name} type={type} value={value} onChange={onChange}
                className="relative block w-full appearance-none rounded-md border border-border-color px-3 pl-10 py-2 bg-background text-text-primary placeholder-text-secondary focus:z-10 focus:border-accent focus:outline-none focus:ring-accent"
                placeholder={placeholder} 
            />
        </div>
    </div>
);

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await api.forgotPassword({ email });
            setMessage(response.message);
        } catch (err) {
            setError(err.message || 'Error al procesar la solicitud.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-[90%] sm:w-full max-w-md space-y-8 rounded-xl bg-component-bg p-8 sm:p-10 shadow-lg border border-border-color">
                <div className="mx-auto flex h-12 w-auto items-center justify-center text-accent">
                    <FontAwesomeIcon icon={faCar} className="h-10 w-10" />
                </div>
                
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
                    RECUPERAR CONTRASEÑA
                </h2>

                <p className="text-center text-sm text-text-secondary">
                    INTRODUCE TU EMAIL Y TE ENVIAREMOS UN ENLACE PARA RESTABLECER TU CONTRASEÑA.
                </p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4 rounded-md">
                        <InputField name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    </div>

                    {error && <p className="text-sm text-red-accent text-center">{error}</p>}
                    {message && <p className="text-sm text-green-accent text-center">{message}</p>}

                    <div>
                        <button type="submit" disabled={isLoading || message}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50">
                            {isLoading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <Link to="/login" className="font-medium text-accent hover:opacity-80">
                        VOLVER A INICIAR SESIÓN
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;