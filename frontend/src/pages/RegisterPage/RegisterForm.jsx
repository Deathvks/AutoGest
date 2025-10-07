// autogest-app/frontend/src/pages/RegisterPage/RegisterForm.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faKey, faSpinner } from '@fortawesome/free-solid-svg-icons';

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
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-text-primary">
                    Crear una Cuenta
                </h2>
                <p className="mt-2 text-text-secondary">Empieza a gestionar tu negocio hoy mismo.</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleRegisterSubmit} noValidate>
                <div className="space-y-4">
                    <InputField name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" icon={faUser} />
                    <InputField name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" icon={faEnvelope} />
                    <InputField name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" icon={faKey} />
                </div>

                {error && <p className="text-sm text-red-accent text-center font-medium">{error}</p>}
                {success && <p className="text-sm text-green-accent text-center font-medium">{success}</p>}

                <div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-lg border border-transparent bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
                    >
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Crear Cuenta'}
                    </button>
                </div>
            </form>

            <p className="text-center text-sm text-text-secondary">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
                    Inicia sesión
                </Link>
            </p>
        </>
    );
};

export default RegisterForm;