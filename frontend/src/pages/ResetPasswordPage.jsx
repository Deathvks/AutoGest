// autogest-app/frontend/src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faKey, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const InputField = ({ name, type, value, onChange, placeholder, icon }) => (
    <div className="relative">
        <FontAwesomeIcon icon={icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
            id={name} name={name} type={type} value={value} onChange={onChange}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-gray-900 placeholder:text-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            {/* Se ha eliminado el fondo decorativo para mantener el estilo corporativo limpio */}
            
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-sm border border-gray-200">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4 text-accent border border-red-100">
                        <FontAwesomeIcon icon={faCar} className="h-8 w-8" />
                    </div>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 uppercase">
                        Establecer Nueva Contraseña
                    </h2>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <InputField name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva Contraseña" icon={faKey} />
                        <InputField name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar Nueva Contraseña" icon={faKey} />
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 text-center font-bold">{error}</p>}
                    {message && <p className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200 text-center font-bold">{message}</p>}

                    <div>
                        <button 
                            type="submit" 
                            disabled={isLoading || !!message}
                            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-accent px-4 py-3 text-sm font-bold text-white shadow hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 transition-colors uppercase tracking-wide"
                        >
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Guardar Contraseña'}
                        </button>
                    </div>
                </form>
                {message && (
                    <div className="text-center text-sm pt-4 border-t border-gray-100">
                        <Link to="/login" className="font-bold text-accent hover:text-accent-hover transition-colors uppercase text-xs">
                            Ir a Iniciar Sesión
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;