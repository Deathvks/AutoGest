// autogest-app/frontend/src/pages/LoginPage.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faEnvelope, faKey, faTimes } from '@fortawesome/free-solid-svg-icons';

// --- INICIO DE LA MODIFICACIÓN: Componente del Modal de Verificación ---

const ForceVerificationModal = ({ isOpen, currentEmail, onClose, onVerified }) => {
    const [step, setStep] = useState('send'); // 'send' o 'verify'
    const [newEmail, setNewEmail] = useState('');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [code, setCode] = useState(Array(6).fill(''));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const codeInputs = useRef([]);

    const emailToSend = isEditingEmail ? newEmail : currentEmail;

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setStep('send');
            setNewEmail('');
            setIsEditingEmail(false);
            setCode(Array(6).fill(''));
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

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
                onVerified(); // Llama a la función para cerrar el modal y resetear
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
                                    <p className="font-semibold text-text-primary p-2">{currentEmail}</p>
                                )}
                                <button onClick={() => setIsEditingEmail(!isEditingEmail)} className="text-xs text-accent hover:underline mt-1">
                                    {isEditingEmail ? 'Usar mi correo actual' : '¿Prefieres usar otro correo?'}
                                </button>
                                {isEditingEmail && <p className="text-xs text-yellow-accent mt-2">Tu email se actualizará a esta nueva dirección una vez verificado.</p>}
                            </div>
                        </>
                    ) : (
                        <p className="text-text-secondary mt-4">Introduce el código de 6 dígitos enviado a <span className="font-semibold text-text-primary">{emailToSend}</span>.</p>
                    )}
                    
                    {step === 'verify' && (
                        <form onSubmit={handleVerificationSubmit} noValidate>
                            <div className="flex justify-center gap-2 my-6">
                                {code.map((digit, index) => (
                                    <input key={index} ref={el => codeInputs.current[index] = el} type="text" maxLength="1" value={digit} onChange={(e) => handleCodeChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)}
                                        className="w-12 h-14 text-center text-2xl font-bold rounded-md border border-border-color bg-background text-text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
                                ))}
                            </div>
                        </form>
                    )}

                    {error && <p className="text-sm text-red-accent text-center mt-4">{error}</p>}
                    {success && <p className="text-sm text-green-accent text-center mt-4">{success}</p>}
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover">
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
// --- FIN DE LA MODIFICACIÓN ---


// --- COMPONENTE PRINCIPAL (LoginPage) MODIFICADO ---

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verificationData, setVerificationData] = useState({ isOpen: false, email: '' }); // Estado para el modal
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) return setError('Todos los campos son obligatorios.');
        
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            if (err.needsVerification) {
                // Si necesita verificación, abre el modal en lugar de mostrar el error aquí
                setVerificationData({ isOpen: true, email: err.email });
                setError(''); // Limpia el error del formulario de login
            } else {
                setError(err.message || 'Error al iniciar sesión.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleVerified = () => {
        setVerificationData({ isOpen: false, email: '' });
        // Opcional: limpiar campos de login tras verificación exitosa
        setEmail('');
        setPassword('');
    };

    return (
        <>
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="w-[90%] sm:w-full max-w-md space-y-8 rounded-xl bg-component-bg p-8 sm:p-10 shadow-lg border border-border-color">
                    <div className="mx-auto flex h-12 w-auto items-center justify-center text-accent">
                        <FontAwesomeIcon icon={faCar} className="h-10 w-10" />
                    </div>
                    
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
                        INICIAR SESIÓN
                    </h2>
                    <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit} noValidate>
                        <div className="space-y-4 rounded-md">
                            <InputField name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                            <InputField name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
                        </div>
                        {error && <p className="text-sm text-red-accent text-center">{error}</p>}
                        <div>
                            <button type="submit" disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50">
                                {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
                            </button>
                        </div>
                    </form>
                    <div className="text-sm text-center">
                        <Link to="/register" className="font-medium text-accent hover:opacity-80">
                            ¿No tienes cuenta? Regístrate
                        </Link>
                    </div>
                </div>
            </div>

            {/* Renderizar el modal */}
            <ForceVerificationModal 
                isOpen={verificationData.isOpen}
                currentEmail={verificationData.email}
                onClose={() => setVerificationData({ isOpen: false, email: '' })}
                onVerified={handleVerified}
            />
        </>
    );
};

// Componente InputField simplificado
const InputField = ({ name, type, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="sr-only">{placeholder}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange}
            className="relative block w-full appearance-none rounded-md border border-border-color px-3 py-2 bg-background text-text-primary placeholder-text-secondary focus:z-10 focus:border-accent focus:outline-none focus:ring-accent"
            placeholder={placeholder} />
    </div>
);

export default LoginPage;