// autogest-app/frontend/src/pages/ForgotPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faEnvelope, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const InputField = ({ name, type, value, onChange, placeholder, icon }) => (
    <div className="relative">
        <FontAwesomeIcon icon={icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input 
            id={name} name={name} type={type} value={value} onChange={onChange}
            className="w-full appearance-none rounded-lg border border-border-color bg-component-bg-hover px-4 py-3 pl-12 text-text-primary placeholder:text-text-secondary transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(var(--color-accent)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-component-bg p-8 shadow-2xl backdrop-blur-lg border border-border-color">
                <div className="text-center">
                    <FontAwesomeIcon icon={faCar} className="mx-auto h-12 w-auto text-accent" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-text-primary">
                        Recuperar Contraseña
                    </h2>
                    <p className="mt-2 text-text-secondary">
                        Introduce tu email y te enviaremos un enlace para restablecerla.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <InputField name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" icon={faEnvelope} />

                    {error && <p className="text-sm text-red-accent text-center font-medium">{error}</p>}
                    {message && <p className="text-sm text-green-accent text-center font-medium">{message}</p>}

                    <div>
                        <button 
                            type="submit" 
                            disabled={isLoading || resendCooldown > 0}
                            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
                        >
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : (resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Enviar Enlace')}
                        </button>
                    </div>
                </form>
                <p className="text-center text-sm text-text-secondary">
                    <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
                        Volver a Iniciar Sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;