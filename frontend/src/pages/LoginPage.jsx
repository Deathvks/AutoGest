// autogest-app/frontend/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Icono
const CarIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.64 5H8.36a2 2 0 0 0-1.86 1.3L5 10l-2-2"/><path d="M5 10h14"/><path d="M5 10c-1.5 0-3 1.5-3 3v4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-4c0-1.5-1.5-3-3-3z"/><path d="M19 10c-1.5 0-3 1.5-3 3v4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-4c0-1.5-1.5-3-3-3z"/></svg> );

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const validateForm = () => {
        const emailRegex = /\S+@\S+\.\S+/;
        if (!email || !password) {
            setError('Todos los campos son obligatorios.');
            return false;
        }
        if (!emailRegex.test(email)) {
            setError('Por favor, introduce un email válido.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        try {
            const success = await login(email, password);
            if (success) {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-[90%] sm:w-full max-w-md space-y-8 rounded-xl bg-component-bg p-8 sm:p-10 shadow-lg border border-border-color">
                <div>
                    <div className="mx-auto flex h-12 w-auto items-center justify-center text-blue-accent">
                        <CarIcon className="h-10 w-10" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
                        Iniciar Sesión
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4 rounded-md">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input id="email-address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="relative block w-full appearance-none rounded-md border border-border-color px-3 py-2 bg-background text-text-primary placeholder-text-secondary focus:z-10 focus:border-blue-accent focus:outline-none focus:ring-blue-accent"
                                placeholder="Email" />
                        </div>
                        <div>
                            <label htmlFor="password"className="sr-only">Contraseña</label>
                            <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full appearance-none rounded-md border border-border-color px-3 py-2 bg-background text-text-primary placeholder-text-secondary focus:z-10 focus:border-blue-accent focus:outline-none focus:ring-blue-accent"
                                placeholder="Contraseña" />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-accent">{error}</p>}
                    <div>
                        <button type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-accent focus:ring-offset-2">
                            Entrar
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <Link to="/register" className="font-medium text-blue-accent hover:opacity-80">
                        ¿No tienes cuenta? Regístrate
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;