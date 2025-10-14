// autogest-app/frontend/src/App.jsx
import React, { useContext, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import api from './services/api';

// Componentes
import InvitationModal from './components/modals/InvitationModal';
import CookieConsent from './components/CookieConsent';

// Carga perezosa (lazy loading)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const AcceptInvitationPage = lazy(() => import('./pages/AcceptInvitationPage'));
const MainLayout = lazy(() => import('./layouts/MainLayout'));

function App() {
    const { token, isAuthLoading, pendingInvitationToken, setPendingInvitationToken, refreshUser } = useContext(AuthContext);

    const handleAcceptInvitation = async (invitationToken) => {
        try {
            await api.company.acceptInvitation({ token: invitationToken });
            toast.success('¡Te has unido al equipo con éxito!');
            const handledTokens = JSON.parse(localStorage.getItem('handledInvitationTokens') || '[]');
            if (!handledTokens.includes(invitationToken)) {
                localStorage.setItem('handledInvitationTokens', JSON.stringify([...handledTokens, invitationToken]));
            }
            await refreshUser();
            setPendingInvitationToken(null);
        } catch (err) {
            toast.error(err.message || 'No se pudo aceptar la invitación.');
            // No cerramos el modal si hay un error, para que el usuario pueda reintentar.
            throw err;
        }
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
        <div className="font-sans">
            <Toaster position="bottom-center" toastOptions={{
                className: 'bg-component-bg text-text-primary border border-border-color shadow-lg',
            }}/>
            <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background text-text-primary">Cargando...</div>}>
                <Routes>
                    <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" replace />} />
                    <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/" replace />} />
                    <Route path="/forgot-password" element={!token ? <ForgotPasswordPage /> : <Navigate to="/" replace />} />
                    <Route path="/reset-password/:token" element={!token ? <ResetPasswordPage /> : <Navigate to="/" replace />} />
                    <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                    <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />
                    <Route path="/*" element={token ? <MainLayout /> : <Navigate to="/login" replace />} />
                </Routes>
            </Suspense>

            {pendingInvitationToken && (
                <InvitationModal
                    token={pendingInvitationToken}
                    onAccept={handleAcceptInvitation}
                    onClose={handleDeclineInvitation}
                />
            )}
            <CookieConsent />
        </div>
    );
}

export default App;