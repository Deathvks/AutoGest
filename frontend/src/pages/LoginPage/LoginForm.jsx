// autogest-app/frontend/src/pages/LoginPage/LoginForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faEnvelope, faKey, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const InputField = ({ name, type, value, onChange, placeholder, icon }) => (
    <div className="relative mb-4">
        <FontAwesomeIcon icon={icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
            placeholder={placeholder}
        />
    </div>
);

const LoginForm = ({ onNeedsVerification }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            
            const loginRedirect = localStorage.getItem('loginRedirect');
            if (loginRedirect) {
                localStorage.removeItem('loginRedirect');
                navigate(loginRedirect, { replace: true });
            } else {
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            }
            
        } catch (err) {
            if (err.needsVerification) {
                onNeedsVerification(err.email);
            } else {
                setError(err.message || 'Error al iniciar sesión.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            {/* Fondo decorativo sutil */}
            <div className="absolute inset-0 -z-10 bg-background"></div>
            
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4 text-accent border border-red-100">
                        <FontAwesomeIcon icon={faCar} className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight uppercase">
                        Te damos la bienvenida
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">Introduce tus datos para entrar</p>
                </div>
                
                <form className="space-y-6" onSubmit={handleLoginSubmit} noValidate>
                    <div>
                        <InputField name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" icon={faEnvelope} />
                        <div className="relative">
                            <FontAwesomeIcon icon={faKey} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pl-12 pr-12 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
                                placeholder="Contraseña"
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link to="/forgot-password" className="text-sm font-bold text-accent hover:text-accent-hover transition-colors">
                            ¿Has olvidado tu contraseña?
                        </Link>
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold rounded-r">
                            {error}
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-accent text-white font-bold py-3.5 rounded-lg shadow-lg hover:bg-accent-hover transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wide text-sm"
                    >
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Entrar'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                        ¿Aún no tienes cuenta?{' '}
                        <Link to="/register" className="font-bold text-accent hover:text-accent-hover transition-colors">
                            Regístrate ahora
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;