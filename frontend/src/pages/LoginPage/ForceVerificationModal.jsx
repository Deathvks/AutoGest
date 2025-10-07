// autogest-app/frontend/src/pages/LoginPage/ForceVerificationModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';

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
        if (e) e.preventDefault();
        setError('');
        setSuccess('');
        const verificationCode = code.join('');

        if (verificationCode.length < 6) {
            return setError('El código debe tener 6 caracteres.');
        }
        setIsLoading(true);
        try {
            const data = { email: currentEmail, code: verificationCode };
            if (isEditingEmail && newEmail) {
                data.newEmail = newEmail;
            }
            const response = await api.verifyEmail(data);
            setSuccess(response.message);
            setTimeout(onVerified, 2000);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-3"><FontAwesomeIcon icon={faEnvelope} />Verificación Requerida</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><FontAwesomeIcon icon={faXmark} className="w-6 h-6" /></button>
                </div>
                
                <div className="p-6">
                    {step === 'send' ? (
                        <div className="space-y-4">
                            <p className="text-text-secondary text-center">Para continuar, necesitamos verificar tu cuenta. Se enviará un código a tu correo.</p>
                            <div className="text-left">
                                <label className="block text-sm font-semibold text-text-primary mb-1 uppercase">Correo de verificación</label>
                                {isEditingEmail ? (
                                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="NUEVO CORREO ELECTRÓNICO" className="w-full mt-1 px-3 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent text-text-primary placeholder:text-text-secondary" />
                                ) : (
                                    <p className="font-semibold text-text-primary w-full mt-1 px-3 py-2 bg-component-bg-hover border border-border-color rounded-lg break-words">{currentEmail}</p>
                                )}
                                <button onClick={() => setIsEditingEmail(!isEditingEmail)} className="text-xs text-accent hover:opacity-80 transition-opacity mt-2">
                                    {isEditingEmail ? 'Usar mi correo actual' : '¿Prefieres usar otro correo?'}
                                </button>
                                {isEditingEmail && <p className="text-xs text-yellow-accent mt-2">Tu email se actualizará a esta nueva dirección una vez verificado.</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-text-secondary text-center">Introduce el código de 6 dígitos enviado a <span className="font-semibold text-text-primary break-words">{emailToSend}</span>.</p>
                            <form onSubmit={handleVerificationSubmit} noValidate>
                                <div className="flex justify-center gap-2 my-4" onPaste={handlePaste}>
                                    {code.map((digit, index) => (
                                        <input key={index} ref={el => codeInputs.current[index] = el} type="text" maxLength="1" value={digit} onChange={(e) => handleCodeChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)}
                                            className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-border-color bg-component-bg-hover text-text-primary transition-colors focus:border-accent focus:ring-1 focus:ring-accent" />
                                    ))}
                                </div>
                            </form>
                            <div className="text-sm text-center">
                                <button type="button" onClick={handleSendCode} disabled={isLoading || resendCooldown > 0} className="font-medium text-accent hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : '¿No has recibido el código? Reenviar'}
                                </button>
                            </div>
                        </div>
                    )}
                     {error && <p className="text-sm text-red-accent text-center mt-4 font-semibold uppercase">{error}</p>}
                     {success && <p className="text-sm text-green-accent text-center mt-4 font-semibold uppercase">{success}</p>}
                </div>

                <div className="flex justify-end items-center gap-4 p-4 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    <button onClick={onClose} className="bg-component-bg border border-border-color text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold uppercase">Cancelar</button>
                    {step === 'send' ? (
                        <button onClick={handleSendCode} disabled={isLoading} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover font-semibold disabled:opacity-50 uppercase">
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Enviar Código'}
                        </button>
                    ) : (
                        <button onClick={handleVerificationSubmit} disabled={isLoading} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover font-semibold disabled:opacity-50 uppercase">
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Verificar'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForceVerificationModal;