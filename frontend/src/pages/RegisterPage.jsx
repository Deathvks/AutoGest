// autogest-app/frontend/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';
import RegisterForm from './RegisterPage/RegisterForm';
import VerificationForm from './RegisterPage/VerificationForm';

const RegisterPage = () => {
    const [step, setStep] = useState('register');
    const [email, setEmail] = useState('');

    // --- INICIO DE LA MODIFICACIÓN ---
    useEffect(() => {
        // Al cargar la página, comprueba si hay un email pendiente de verificar
        const emailToVerify = localStorage.getItem('emailToVerify');
        if (emailToVerify) {
            setEmail(emailToVerify);
            setStep('verify');
        }
    }, []);

    const handleRegistrationSuccess = (registeredEmail) => {
        // Guarda el email en localStorage para persistir el estado
        localStorage.setItem('emailToVerify', registeredEmail);
        setEmail(registeredEmail);
        setStep('verify');
    };
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-[90%] sm:w-full max-w-md space-y-8 rounded-xl bg-component-bg p-8 sm:p-10 shadow-lg border border-border-color">
                <div className="mx-auto flex h-12 w-auto items-center justify-center text-accent">
                    <FontAwesomeIcon icon={faCar} className="h-10 w-10" />
                </div>
                
                {step === 'register' ? (
                    <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
                ) : (
                    <VerificationForm email={email} />
                )}
            </div>
        </div>
    );
};

export default RegisterPage;