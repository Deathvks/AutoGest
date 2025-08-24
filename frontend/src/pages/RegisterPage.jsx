import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Icono
const CarIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.64 5H8.36a2 2 0 0 0-1.86 1.3L5 10l-2-2"/><path d="M5 10h14"/><path d="M5 10c-1.5 0-3 1.5-3 3v4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-4c0-1.5-1.5-3-3-3z"/><path d="M19 10c-1.5 0-3 1.5-3 3v4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-4c0-1.5-1.5-3-3-3z"/></svg> );

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const validateForm = () => {
        const emailRegex = /\S+@\S+\.\S+/;
        if (!name || !email || !password) {
            setError('Todos los campos son obligatorios.');
            return false;
        }
        if (!emailRegex.test(email)) {
            setError('Por favor, introduce un email válido.');
            return false;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        try {
            await api.register({ name, email, password });
            setSuccess('¡Registro completado! Serás redirigido al login.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Error en el registro. Inténtalo de nuevo.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg dark:bg-slate-800">
                <div>
                    <div className="mx-auto flex h-12 w-auto items-center justify-center text-blue-600 dark:text-blue-400">
                        <CarIcon className="h-10 w-10" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Crear una Cuenta
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="name" className="sr-only">Nombre</label>
                            <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                placeholder="Nombre completo" />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input id="email-address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                placeholder="Email" />
                        </div>
                        <div>
                            <label htmlFor="password"className="sr-only">Contraseña</label>
                            <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                placeholder="Contraseña" />
                        </div>
                    </div>

                    {error && <p className="text-sm text-rose-600">{error}</p>}
                    {success && <p className="text-sm text-emerald-600">{success}</p>}

                    <div>
                        <button type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            Registrarse
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        ¿Ya tienes una cuenta? Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;