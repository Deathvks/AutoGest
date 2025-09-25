// autogest-app/frontend/src/pages/RegisterPage/RegisterForm.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const InputField = ({ name, type, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="sr-only">{placeholder}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange}
            className="relative block w-full appearance-none rounded-md border border-border-color px-3 py-2 bg-background text-text-primary placeholder-text-secondary focus:z-10 focus:border-accent focus:outline-none focus:ring-accent"
            placeholder={placeholder} />
    </div>
);

const RegisterForm = ({ onRegistrationSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateRegisterForm = () => {
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

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateRegisterForm()) {
            return;
        }
        
        setIsLoading(true);
        try {
            await api.register({ name, email, password });
            setSuccess('¡Código enviado! Revisa tu correo electrónico.');
            setTimeout(() => {
                setSuccess('');
                onRegistrationSuccess(email); 
            }, 2000);
        } catch (err) {
            setError(err.message || 'Error en el registro. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
                Crear una Cuenta
            </h2>
            <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit} noValidate>
                <div className="space-y-4 rounded-md">
                    <InputField name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
                    <InputField name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <InputField name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
                </div>

                {error && <p className="text-sm text-red-accent text-center">{error}</p>}
                {success && <p className="text-sm text-green-accent text-center">{success}</p>}

                <div>
                    <button type="submit" disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50">
                        {isLoading ? 'CREANDO...' : 'CREAR CUENTA'}
                    </button>
                </div>
            </form>
            <div className="text-sm text-center">
                <Link to="/login" className="font-medium text-accent hover:opacity-80">
                    ¿Ya tienes una cuenta? Inicia sesión
                </Link>
            </div>
        </>
    );
};

export default RegisterForm;