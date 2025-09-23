// autogest-app/frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import LoginForm from './LoginPage/LoginForm';
import ForceVerificationModal from './LoginPage/ForceVerificationModal';

const LoginPage = () => {
    const [verificationData, setVerificationData] = useState({ isOpen: false, email: '' });

    const handleNeedsVerification = (email) => {
        setVerificationData({ isOpen: true, email });
    };

    const handleVerified = () => {
        setVerificationData({ isOpen: false, email: '' });
    };

    return (
        <>
            <LoginForm onNeedsVerification={handleNeedsVerification} />
            <ForceVerificationModal 
                isOpen={verificationData.isOpen}
                currentEmail={verificationData.email}
                onClose={() => setVerificationData({ isOpen: false, email: '' })}
                onVerified={handleVerified}
            />
        </>
    );
};

export default LoginPage;