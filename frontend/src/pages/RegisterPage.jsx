// autogest-app/frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';
import RegisterForm from './RegisterPage/RegisterForm';
import VerificationForm from './RegisterPage/VerificationForm';

const RegisterPage = () => {
    const [step, setStep] = useState('register'); // 'register' o 'verify'
    const [email, setEmail] = useState('');

    const handleRegistrationSuccess = (registeredEmail) => {
        setEmail(registeredEmail);
        setStep('verify');
    };

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