// autogest-app/frontend/src/App.jsx
import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './layouts/MainLayout';
import SubscriptionPage from './pages/SubscriptionPage';

// Componente intermedio para manejar la lógica de redirección
// --- INICIO DE LA MODIFICACIÓN ---
const AppContent = ({ isDarkMode, setIsDarkMode }) => { // <-- AQUÍ ESTABA EL ERROR, FALTABAN LAS PROPS
// --- FIN DE LA MODIFICACIÓN ---
    const { user, subscriptionStatus } = useContext(AuthContext);
    const location = useLocation();

    // Roles que no necesitan suscripción
    const isExempt = user && (user.role === 'admin' || user.role === 'technician');
    // El usuario tiene una suscripción activa
    const hasActiveSubscription = subscriptionStatus === 'active';
    // El usuario está en una página permitida sin suscripción activa
    const isAllowedPath = ['/subscription', '/settings', '/profile'].includes(location.pathname);

    if (user && !isExempt && !hasActiveSubscription && !isAllowedPath) {
        // Si el usuario está logueado, no está exento, no tiene suscripción activa
        // y no está en una página permitida, se le redirige a la página de suscripción.
        return <Navigate to="/subscription" replace />;
    }

    return (
        <MainLayout 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
        />
    );
};


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
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                ) : (
                    <Route 
                        path="/*" 
                        element={
                            <AppContent 
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