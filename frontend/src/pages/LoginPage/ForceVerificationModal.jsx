// autogest-app/frontend/src/pages/LoginPage/ForceVerificationModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const ForceVerificationModal = ({ isOpen, currentEmail, onClose, onVerified }) => {
    const [step, setStep] = useState('send');
    const [newEmail, setNewEmail] = useState('');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [code, setCode] = useState(Array(6).fill(''));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const codeInputs = useRef([]);

    const emailToSend = isEditingEmail ? newEmail : currentEmail;

    useEffect(() => {
        if (isOpen) {
            setStep('send');
            setNewEmail('');
            setIsEditingEmail(false);
            setCode(Array(6).fill(''));
            setError('');
            setSuccess('');
            setResendCooldown(0);
        }
    }, [isOpen]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleSendCode = async () => {
        setError('');
        setSuccess('');
        if (isEditingEmail && !newEmail) {
            return setError('Por favor, introduce una nueva dirección de email.');
        }
        setIsLoading(true);
        try {
            const data = { currentEmail };
            if (isEditingEmail && newEmail) {
                data.newEmail = newEmail;
            }
            const response = await api.forceVerification(data);
            setSuccess(response.message);
            setStep('verify');
            setResendCooldown(15);
        } catch (err) {
            setError(err.message || 'No se pudo enviar el código.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const verificationCode = code.join('');

        if (verificationCode.length < 6) {
            return setError('El código debe tener 6 dígitos.');
        }
        setIsLoading(true);
        try {
            const data = { email: currentEmail, code: verificationCode };
            if (isEditingEmail && newEmail) {
                data.newEmail = newEmail;
            }
            const response = await api.verifyEmail(data);
            setSuccess(response.message);
            setTimeout(() => {
                onVerified();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Error en la verificación.');
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
            if (value && index < 5) codeInputs.current[index + 1].focus();
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

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            const data = { currentEmail };
            if (isEditingEmail && newEmail) {
                data.newEmail = newEmail;
            }
            await api.forceVerification(data);
            setSuccess('Se ha reenviado un nuevo código.');
            setResendCooldown(15);
        } catch (err) {
            setError(err.message || 'No se pudo reenviar el código.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={faEnvelope} className="w-16 h-16 text-accent mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-text-primary">VERIFICACIÓN REQUERIDA</h2>
                    
                    {step === 'send' ? (
                        <>
                            <p className="text-text-secondary mt-4">Para continuar, necesitamos verificar tu cuenta. Se enviará un código a tu correo.</p>
                            <div className="mt-6 text-left">
                                <label className="block text-sm font-medium text-text-secondary">Correo de verificación</label>
                                {isEditingEmail ? (
                                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="NUEVO CORREO ELECTRÓNICO" className="w-full mt-1 px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-accent" />
                                ) : (
                                    <p className="font-semibold text-text-primary w-full mt-1 px-3 py-2 bg-background border border-border-color rounded-lg break-words">{currentEmail}</p>
                                )}
                                <button onClick={() => setIsEditingEmail(!isEditingEmail)} className="text-xs text-accent hover:opacity-80 transition-opacity mt-1">
                                    {isEditingEmail ? 'Usar mi correo actual' : '¿Prefieres usar otro correo?'}
                                </button>
                                {isEditingEmail && <p className="text-xs text-yellow-accent mt-2">Tu email se actualizará a esta nueva dirección una vez verificado.</p>}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-text-secondary mt-4">Introduce el código de 6 dígitos enviado a <span className="font-semibold text-text-primary break-words">{emailToSend}</span>.</p>
                            <form onSubmit={handleVerificationSubmit} noValidate>
                                <div className="flex justify-center gap-2 my-6" onPaste={handlePaste}>
                                    {code.map((digit, index) => (
                                        <input key={index} ref={el => codeInputs.current[index] = el} type="text" maxLength="1" value={digit} onChange={(e) => handleCodeChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)}
                                            className="w-12 h-14 text-center text-2xl font-bold rounded-md border border-border-color bg-background text-text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
                                    ))}
                                </div>
                            </form>
                            <div className="text-sm text-center">
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={isLoading || resendCooldown > 0}
                                    className="font-medium text-accent hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resendCooldown > 0 ? `REENVIAR EN ${resendCooldown}S` : '¿NO HAS RECIBIDO EL CÓDIGO? REENVIAR'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <div className="mt-6 text-sm">
                        <button onClick={onClose} className="font-medium text-accent hover:opacity-80">
                            Volver a Iniciar Sesión
                        </button>
                    </div>
                    {/* --- FIN DE LA MODIFICACIÓN --- */}

                    {error && <p className="text-sm text-red-accent text-center mt-4">{error}</p>}
                    {success && <p className="text-sm text-green-accent text-center mt-4">{success}</p>}
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    {step === 'send' ? (
                        <button onClick={handleSendCode} disabled={isLoading} className="w-full bg-accent text-white px-8 py-3 rounded-lg shadow-lg hover:bg-accent-hover font-semibold disabled:opacity-50">
                            {isLoading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
                        </button>
                    ) : (
                        <button onClick={handleVerificationSubmit} disabled={isLoading} className="w-full bg-accent text-white px-8 py-3 rounded-lg shadow-lg hover:bg-accent-hover font-semibold disabled:opacity-50">
                            {isLoading ? 'VERIFICANDO...' : 'VERIFICAR'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForceVerificationModal;