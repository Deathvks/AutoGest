// autogest-app/frontend/src/pages/RegisterPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Icono
const CarIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.64 5H8.36a2 2 0 0 0-1.86 1.3L5 10l-2-2"/><path d="M5 10h14"/><path d="M5 10c-1.5 0-3 1.5-3 3v4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-4c0-1.5-1.5-3-3-3z"/><path d="M19 10c-1.5 0-3 1.5-3 3v4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-4c0-1.5-1.5-3-3-3z"/></svg> );

const RegisterPage = () => {
    const [step, setStep] = useState('register'); // 'register' o 'verify'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState(Array(6).fill(''));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const codeInputs = useRef([]);

    useEffect(() => {
        if (step === 'verify') {
            codeInputs.current[0]?.focus();
        }
    }, [step]);

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
                setStep('verify'); 
            }, 2000);
        } catch (err) {
            setError(err.message || 'Error en el registro. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCodeChange = (e, index) => {
        const { value } = e.target;
        if (/^[a-zA-Z0-9]$/.test(value) || value === '') {
            const newCode = [...code];
            newCode[index] = value.toUpperCase();
            setCode(newCode);

            if (value && index < 5) {
                codeInputs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            codeInputs.current[index - 1].focus();
        }
    };

    // --- INICIO DE LA MODIFICACIÓN ---
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        if (/^[a-zA-Z0-9]{6}$/.test(paste)) {
            const newCode = paste.toUpperCase().split('');
            setCode(newCode);
            codeInputs.current[5].focus();
        }
    };
    // --- FIN DE LA MODIFICACIÓN ---

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const verificationCode = code.join('');

        if (verificationCode.length < 6) {
            setError('El código debe tener 6 dígitos.');
            return;
        }

        setIsLoading(true);
        try {
            await api.verifyEmail({ email, code: verificationCode });
            setSuccess('¡Cuenta verificada! Serás redirigido al login.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Error en la verificación. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResendCode = async () => {
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            await api.resendVerificationCode({ email });
            setSuccess('Se ha reenviado un nuevo código a tu correo.');
        } catch (err) {
            setError(err.message || 'No se pudo reenviar el código.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-[90%] sm:w-full max-w-md space-y-8 rounded-xl bg-component-bg p-8 sm:p-10 shadow-lg border border-border-color">
                <div className="mx-auto flex h-12 w-auto items-center justify-center text-blue-accent">
                    <CarIcon className="h-10 w-10" />
                </div>
                
                {step === 'register' ? (
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
                                    className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-accent focus:ring-offset-2 disabled:opacity-50">
                                    {isLoading ? 'CREANDO...' : 'CREAR CUENTA'}
                                </button>
                            </div>
                        </form>
                        <div className="text-sm text-center">
                            <Link to="/login" className="font-medium text-blue-accent hover:opacity-80">
                                ¿Ya tienes una cuenta? Inicia sesión
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
                            Verificar Cuenta
                        </h2>
                        <p className="text-center text-sm text-text-secondary">
                            Introduce el código de 6 dígitos enviado a <span className="font-semibold text-text-primary">{email}</span>
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleVerificationSubmit} noValidate>
                            {/* --- INICIO DE LA MODIFICACIÓN --- */}
                            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                            {/* --- FIN DE LA MODIFICACIÓN --- */}
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => codeInputs.current[index] = el}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleCodeChange(e, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        className="w-12 h-14 text-center text-2xl font-bold rounded-md border border-border-color bg-background text-text-primary focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
                                    />
                                ))}
                            </div>
                            
                            {error && <p className="text-sm text-red-accent text-center">{error}</p>}
                            {success && <p className="text-sm text-green-accent text-center">{success}</p>}

                            <div>
                                <button type="submit" disabled={isLoading}
                                    className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-accent focus:ring-offset-2 disabled:opacity-50">
                                    {isLoading ? 'VERIFICANDO...' : 'VERIFICAR CUENTA'}
                                </button>
                            </div>
                        </form>
                        <div className="text-sm text-center">
                            <button onClick={handleResendCode} disabled={isLoading} className="font-medium text-blue-accent hover:opacity-80 disabled:opacity-50">
                                ¿No has recibido el código? Reenviar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Componente InputField simplificado para este formulario
const InputField = ({ name, type, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="sr-only">{placeholder}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange}
            className="relative block w-full appearance-none rounded-md border border-border-color px-3 py-2 bg-background text-text-primary placeholder-text-secondary focus:z-10 focus:border-blue-accent focus:outline-none focus:ring-blue-accent"
            placeholder={placeholder} />
    </div>
);


export default RegisterPage;