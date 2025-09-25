// autogest-app/frontend/src/pages/RegisterPage/VerificationForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const VerificationForm = ({ email }) => {
    const [code, setCode] = useState(Array(6).fill(''));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(15);
    const navigate = useNavigate();
    const codeInputs = useRef([]);

    useEffect(() => {
        codeInputs.current[0]?.focus();
    }, []);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

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

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text');
        if (/^[a-zA-Z0-9]{6}$/.test(paste)) {
            const newCode = paste.toUpperCase().split('');
            setCode(newCode);
            codeInputs.current[5]?.focus();
        }
    };

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
        if (resendCooldown > 0) return;

        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            await api.resendVerificationCode({ email });
            setSuccess('Se ha reenviado un nuevo código a tu correo.');
            setResendCooldown(15);
        } catch (err) {
            setError(err.message || 'No se pudo reenviar el código.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
                Verificar Cuenta
            </h2>
            <p className="text-center text-sm text-text-secondary">
                Introduce el código de 6 dígitos enviado a <span className="font-semibold text-text-primary break-words">{email}</span>
            </p>
            <form className="mt-8 space-y-6" onSubmit={handleVerificationSubmit} noValidate>
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => codeInputs.current[index] = el}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleCodeChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-12 h-14 text-center text-2xl font-bold rounded-md border border-border-color bg-background text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                        />
                    ))}
                </div>
                
                {error && <p className="text-sm text-red-accent text-center">{error}</p>}
                {success && <p className="text-sm text-green-accent text-center">{success}</p>}

                <div>
                    <button type="submit" disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50">
                        {isLoading ? 'VERIFICANDO...' : 'VERIFICAR CUENTA'}
                    </button>
                </div>
            </form>
            <div className="text-sm text-center">
                <button 
                    onClick={handleResendCode} 
                    disabled={isLoading || resendCooldown > 0} 
                    className="font-medium text-accent hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {resendCooldown > 0 ? `REENVIAR EN ${resendCooldown}S` : '¿NO HAS RECIBIDO EL CÓDIGO? REENVIAR'}
                </button>
            </div>
        </>
    );
};

export default VerificationForm;