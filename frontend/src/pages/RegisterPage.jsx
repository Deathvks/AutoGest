// autogest-app/frontend/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';
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
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(var(--color-accent)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-component-bg p-8 shadow-2xl backdrop-blur-lg border border-border-color">
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