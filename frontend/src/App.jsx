// autogest-app/frontend/src/App.jsx
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useAppState } from './hooks/useAppState';
import AppRoutes from './components/AppRoutes';
import AppModals from './components/AppModals';
import CookieConsent from './components/CookieConsent';
import InvitationModal from './components/modals/InvitationModal';

function App() {
    const { token, user, isAuthLoading, pendingInvitationToken, setPendingInvitationToken } = useContext(AuthContext);
    const appState = useAppState();

    // --- INICIO DE LA MODIFICACIÓN ---
    const { promptTrial } = useContext(AuthContext);

    useEffect(() => {
        if (promptTrial && user) {
            appState.setIsTrialModalOpen(true);
        }
    }, [promptTrial, user, appState.setIsTrialModalOpen]);
    // --- FIN DE LA MODIFICACIÓN ---
    
    // Lógica para el modal de invitación
    const handleAcceptInvitation = (invitationToken) => {
        // ... (lógica existente)
    };

    const handleDeclineInvitation = () => {
        if (pendingInvitationToken) {
            const handledTokens = JSON.parse(localStorage.getItem('handledInvitationTokens') || '[]');
            if (!handledTokens.includes(pendingInvitationToken)) {
                localStorage.setItem('handledInvitationTokens', JSON.stringify([...handledTokens, pendingInvitationToken]));
            }
        }
        setPendingInvitationToken(null);
    };

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-text-primary">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
                    <span>Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="font-sans">
                <AppRoutes token={token} user={user} appState={appState} />
                {token && <AppModals appState={appState} />}
                <CookieConsent />
                {pendingInvitationToken && (
                    <InvitationModal
                        isOpen={!!pendingInvitationToken}
                        onAccept={handleAcceptInvitation}
                        onDecline={handleDeclineInvitation}
                        token={pendingInvitationToken}
                    />
                )}
            </div>
        </Router>
    );
}

export default App;