// autogest-app/frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import LoginForm from './LoginPage/LoginForm';
import ForceVerificationModal from './LoginPage/ForceVerificationModal';

const LoginPage = () => {
    const [verificationData, setVerificationData] = useState({ isOpen: false, email: '' });

    useEffect(() => {
        const emailToVerify = localStorage.getItem('emailForcedVerification');
        if (emailToVerify) {
            setVerificationData({ isOpen: true, email: emailToVerify });
        }
    }, []);

    const handleNeedsVerification = (email) => {
        localStorage.setItem('emailForcedVerification', email);
        setVerificationData({ isOpen: true, email });
    };

    const handleCloseOrVerified = () => {
        localStorage.removeItem('emailForcedVerification');
        setVerificationData({ isOpen: false, email: '' });
    };

    return (
        <>
            <LoginForm onNeedsVerification={handleNeedsVerification} />
            <ForceVerificationModal 
                isOpen={verificationData.isOpen}
                currentEmail={verificationData.email}
                onClose={handleCloseOrVerified}
                onVerified={handleCloseOrVerified}
            />
        </>
    );
};

export default LoginPage;