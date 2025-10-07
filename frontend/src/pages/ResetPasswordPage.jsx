// autogest-app/frontend/src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faKey, faSpinner } from '@fortawesome/free-solid-svg-icons';
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

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden.');
        }
        if (password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres.');
        }

        setIsLoading(true);
        try {
            const response = await api.resetPassword(token, { password });
            setMessage(response.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Error al restablecer la contraseña.');
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
                        Establecer Nueva Contraseña
                    </h2>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <InputField name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva Contraseña" icon={faKey} />
                        <InputField name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar Nueva Contraseña" icon={faKey} />
                    </div>

                    {error && <p className="text-sm text-red-accent text-center font-medium">{error}</p>}
                    {message && <p className="text-sm text-green-accent text-center font-medium">{message}</p>}

                    <div>
                        <button 
                            type="submit" 
                            disabled={isLoading || !!message}
                            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
                        >
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Guardar Contraseña'}
                        </button>
                    </div>
                </form>
                {message && (
                    <div className="text-center text-sm">
                        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
                            Ir a Iniciar Sesión
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;