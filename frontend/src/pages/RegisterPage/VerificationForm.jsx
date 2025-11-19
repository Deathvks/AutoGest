// autogest-app/frontend/src/pages/RegisterPage/VerificationForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

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
        const paste = e.clipboardData.getData('text').trim();
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
            setError('El código debe tener 6 caracteres.');
            return;
        }

        setIsLoading(true);
        try {
            await api.verifyEmail({ email, code: verificationCode });
            localStorage.removeItem('emailToVerify');
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
            <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 uppercase">
                    Verificar Cuenta
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    Introduce el código de 6 dígitos enviado a <br/> 
                    <span className="font-bold text-gray-900 break-all">{email}</span>
                </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleVerificationSubmit} noValidate>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => codeInputs.current[index] = el}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleCodeChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors shadow-sm placeholder-gray-300"
                        />
                    ))}
                </div>
                
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 text-center font-bold">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200 text-center font-bold">
                        {success}
                    </div>
                )}

                <div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-lg border border-transparent bg-accent px-4 py-3 text-sm font-bold text-white shadow hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
                    >
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Verificar Cuenta'}
                    </button>
                </div>
            </form>

            <div className="text-center mt-6 pt-4 border-t border-gray-100">
                <button 
                    onClick={handleResendCode} 
                    disabled={isLoading || resendCooldown > 0} 
                    className="text-xs font-bold text-accent hover:text-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase"
                >
                    {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : '¿No has recibido el código? Reenviar'}
                </button>
            </div>
        </>
    );
};

export default VerificationForm;