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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-300 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 uppercase tracking-tight">
                        <FontAwesomeIcon icon={faEnvelope} className="text-accent"/>
                        Verificación
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 bg-white">
                    {step === 'send' ? (
                        <div className="space-y-6">
                            <p className="text-gray-600 text-center text-sm font-medium">
                                Para continuar, necesitamos verificar tu cuenta. Se enviará un código a tu correo.
                            </p>
                            <div className="text-left">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Correo de verificación</label>
                                {isEditingEmail ? (
                                    <input 
                                        type="email" 
                                        value={newEmail} 
                                        onChange={(e) => setNewEmail(e.target.value)} 
                                        placeholder="NUEVO CORREO ELECTRÓNICO" 
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors shadow-sm" 
                                    />
                                ) : (
                                    <div className="font-bold text-gray-900 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg break-all">
                                        {currentEmail}
                                    </div>
                                )}
                                <button 
                                    onClick={() => setIsEditingEmail(!isEditingEmail)} 
                                    className="text-xs font-bold text-accent hover:text-accent-hover transition-colors mt-3 uppercase"
                                >
                                    {isEditingEmail ? 'Usar mi correo actual' : '¿Cambiar correo?'}
                                </button>
                                {isEditingEmail && <p className="text-xs text-yellow-600 mt-2 bg-yellow-50 p-2 rounded border border-yellow-200 font-medium">Tu email se actualizará a esta nueva dirección una vez verificado.</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-gray-600 text-center text-sm font-medium">
                                Introduce el código de 6 dígitos enviado a <br/>
                                <span className="font-bold text-gray-900 break-all">{emailToSend}</span>.
                            </p>
                            <form onSubmit={handleVerificationSubmit} noValidate>
                                <div className="flex justify-center gap-2 my-4" onPaste={handlePaste}>
                                    {code.map((digit, index) => (
                                        <input 
                                            key={index} 
                                            ref={el => codeInputs.current[index] = el} 
                                            type="text" 
                                            maxLength="1" 
                                            value={digit} 
                                            onChange={(e) => handleCodeChange(e, index)} 
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-accent focus:ring-2 focus:ring-accent focus:outline-none transition-all shadow-sm placeholder-gray-300" 
                                        />
                                    ))}
                                </div>
                            </form>
                            <div className="text-center">
                                <button 
                                    type="button" 
                                    onClick={handleSendCode} 
                                    disabled={isLoading || resendCooldown > 0} 
                                    className="text-xs font-bold text-accent hover:text-accent-hover disabled:opacity-50 disabled:cursor-not-allowed uppercase transition-colors"
                                >
                                    {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : '¿No has recibido el código? Reenviar'}
                                </button>
                            </div>
                        </div>
                    )}
                     {error && <div className="mt-4 p-2 bg-red-50 border-l-4 border-red-600 text-red-700 text-xs font-bold uppercase rounded-r text-center">{error}</div>}
                     {success && <div className="mt-4 p-2 bg-green-50 border-l-4 border-green-600 text-green-700 text-xs font-bold uppercase rounded-r text-center">{success}</div>}
                </div>

                <div className="flex justify-end items-center gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose} 
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cancelar
                    </button>
                    {step === 'send' ? (
                        <button 
                            onClick={handleSendCode} 
                            disabled={isLoading} 
                            className="bg-accent text-white px-6 py-2.5 rounded-lg shadow hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Enviar Código'}
                        </button>
                    ) : (
                        <button 
                            onClick={handleVerificationSubmit} 
                            disabled={isLoading} 
                            className="bg-accent text-white px-6 py-2.5 rounded-lg shadow hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Verificar'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForceVerificationModal;