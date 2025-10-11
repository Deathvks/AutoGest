// autogest-app/frontend/src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import CookieConsent from './components/CookieConsent';
import InvitationModal from './components/modals/InvitationModal';

function AppContent() {
  const { token, isAuthLoading, pendingInvitationToken, setPendingInvitationToken } = useContext(AuthContext);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!token ? <ForgotPasswordPage /> : <Navigate to="/" />} />
        <Route path="/reset-password/:token" element={!token ? <ResetPasswordPage /> : <Navigate to="/" />} />
        <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/*" element={token ? <MainLayout /> : <Navigate to="/login" />} />
      </Routes>
      <CookieConsent />
      {pendingInvitationToken && (
        <InvitationModal 
          token={pendingInvitationToken} 
          onClose={() => setPendingInvitationToken(null)} 
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;