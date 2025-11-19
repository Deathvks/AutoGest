// autogest-app/frontend/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import RegisterForm from './RegisterPage/RegisterForm';
import VerificationForm from './RegisterPage/VerificationForm';

const RegisterPage = () => {
    const [step, setStep] = useState('register');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const emailToVerify = localStorage.getItem('emailToVerify');
        const verificationTimestamp = localStorage.getItem('verificationTimestamp');
        const fiveMinutes = 5 * 60 * 1000;

        if (emailToVerify && verificationTimestamp && (Date.now() - verificationTimestamp < fiveMinutes)) {
            setEmail(emailToVerify);
            setStep('verify');
        } else {
            localStorage.removeItem('emailToVerify');
            localStorage.removeItem('verificationTimestamp');
        }
    }, []);

    const handleRegistrationSuccess = (registeredEmail) => {
        localStorage.setItem('emailToVerify', registeredEmail);
        localStorage.setItem('verificationTimestamp', Date.now());
        setEmail(registeredEmail);
        setStep('verify');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            {/* Fondo decorativo sutil */}
            <div className="absolute inset-0 -z-10 bg-background"></div>
            
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                {/* El icono se ha eliminado de aquí para que lo gestione cada formulario individualmente */}
                
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