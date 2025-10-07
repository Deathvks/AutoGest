// autogest-app/frontend/src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // <-- 1. Importa el proveedor de temas

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './layouts/MainLayout';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';

const App = () => {
    const { token, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-background text-text-primary">Verificando sesión...</div>;
    }

    return (
        // --- INICIO DE LA MODIFICACIÓN ---
        <ThemeProvider> {/* <-- 2. Envuelve la aplicación con el proveedor de temas */}
            <div className="circles-container">
                <div className="circles">
                    <div className="circle circle-1"></div>
                    <div className="circle circle-2"></div>
                </div>
            </div>
            <Router>
                <Routes>
                    {!token ? (
                        <>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                            <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </>
                    ) : (
                        <Route 
                            path="/*" 
                            element={
                                <MainLayout />
                            } 
                        />
                    )}
                </Routes>
            </Router>
        </ThemeProvider>
        // --- FIN DE LA MODIFICACIÓN ---
    );
};

export default App;