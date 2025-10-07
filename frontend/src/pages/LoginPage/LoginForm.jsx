// autogest-app/frontend/src/pages/LoginPage/LoginForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faEnvelope, faKey, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const InputField = ({ name, type, value, onChange, placeholder, icon }) => (
    <div className="relative">
        <FontAwesomeIcon icon={icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className="w-full appearance-none rounded-lg border border-border-color bg-component-bg-hover px-4 py-3 pl-12 text-text-primary placeholder:text-text-secondary transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(var(--color-accent)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-component-bg p-8 shadow-2xl backdrop-blur-lg border border-border-color">
                <div className="text-center">
                    <FontAwesomeIcon icon={faCar} className="mx-auto h-12 w-auto text-accent" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-text-primary">
                        Iniciar Sesión
                    </h2>
                    <p className="mt-2 text-text-secondary">Bienvenido de nuevo a AutoGest.</p>
                </div>
                
                <form className="space-y-6" onSubmit={handleLoginSubmit} noValidate>
                    <div className="space-y-4">
                        <InputField name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" icon={faEnvelope} />
                        <div className="relative">
                            <FontAwesomeIcon icon={faKey} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-border-color bg-component-bg-hover px-4 py-3 pl-12 pr-12 text-text-primary placeholder:text-text-secondary transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                placeholder="Contraseña"
                            />
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary cursor-pointer hover:text-text-primary"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end text-sm">
                        <Link to="/forgot-password" className="font-medium text-accent hover:text-accent-hover">
                            ¿Has olvidado tu contraseña?
                        </Link>
                    </div>
                    
                    {error && <p className="text-sm text-red-accent text-center font-medium">{error}</p>}
                    
                    <div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
                        >
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Entrar'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-text-secondary">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
                        Regístrate ahora
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;