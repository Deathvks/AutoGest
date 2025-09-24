// autogest-app/frontend/src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const InputField = ({ name, type, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="sr-only">{placeholder}</label>
        <input 
            id={name} name={name} type={type} value={value} onChange={onChange}
            className="relative block w-full appearance-none rounded-md border border-border-color px-3 py-2 bg-background text-text-primary placeholder-text-secondary focus:z-10 focus:border-accent focus:outline-none focus:ring-accent"
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
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-[90%] sm:w-full max-w-md space-y-8 rounded-xl bg-component-bg p-8 sm:p-10 shadow-lg border border-border-color">
                <div className="mx-auto flex h-12 w-auto items-center justify-center text-accent">
                    <FontAwesomeIcon icon={faCar} className="h-10 w-10" />
                </div>
                
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
                    ESTABLECER NUEVA CONTRASEÑA
                </h2>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4 rounded-md">
                        <InputField name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva Contraseña" />
                        <InputField name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar Nueva Contraseña" />
                    </div>

                    {error && <p className="text-sm text-red-accent text-center">{error}</p>}
                    {message && <p className="text-sm text-green-accent text-center">{message}</p>}

                    <div>
                        <button type="submit" disabled={isLoading || message}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50">
                            {isLoading ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA'}
                        </button>
                    </div>
                </form>
                {message && (
                    <div className="text-sm text-center">
                        <Link to="/login" className="font-medium text-accent hover:opacity-80">
                            Ir a Iniciar Sesión
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;