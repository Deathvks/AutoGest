// autogest-app/frontend/src/App.jsx
import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './layouts/MainLayout';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
// --- INICIO DE LA MODIFICACIÓN ---
import AcceptInvitationPage from './pages/AcceptInvitationPage';
// --- FIN DE LA MODIFICACIÓN ---

const App = () => {
    const { token, isLoading } = useContext(AuthContext);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-background text-text-primary">Verificando sesión...</div>;
    }

    return (
        <Router>
            <Routes>
                {!token ? (
                    <>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                        <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                ) : (
                    <Route 
                        path="/*" 
                        element={
                            <MainLayout 
                                isDarkMode={isDarkMode} 
                                setIsDarkMode={setIsDarkMode} 
                            />
                        } 
                    />
                )}
            </Routes>
        </Router>
    );
};

export default App;