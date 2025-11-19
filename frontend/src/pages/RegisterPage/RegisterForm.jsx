// autogest-app/frontend/src/pages/RegisterPage/RegisterForm.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faKey, faSpinner, faCar } from '@fortawesome/free-solid-svg-icons';

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
            <div className="text-center mb-8">
                {/* ICONO PRINCIPAL DEL COCHE */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4 text-accent border border-red-100">
                    <FontAwesomeIcon icon={faCar} className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight uppercase">
                    Crear Cuenta
                </h2>
                <p className="mt-2 text-sm text-gray-500 font-medium">Únete a AutoGest hoy mismo</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleRegisterSubmit} noValidate>
                <div>
                    <InputField name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" icon={faUser} />
                    <InputField name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" icon={faEnvelope} />
                    <InputField name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" icon={faKey} />
                </div>

                {error && <p className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold rounded-r text-center">{error}</p>}
                {success && <p className="p-3 bg-green-50 border-l-4 border-green-600 text-green-700 text-sm font-bold rounded-r text-center">{success}</p>}

                <div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-accent text-white font-bold py-3.5 rounded-lg shadow-lg hover:bg-accent-hover transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wide text-sm"
                    >
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Crear Cuenta'}
                    </button>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="font-bold text-accent hover:text-accent-hover transition-colors">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </>
    );
};

export default RegisterForm;