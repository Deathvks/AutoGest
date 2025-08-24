import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // <-- 1. Importa la nueva página
import MainLayout from './layouts/MainLayout';

const App = () => {
    const { token, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">Verificando sesión...</div>;
    }

    return (
        <Router>
            <Routes>
                {!token ? (
                    <>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} /> {/* <-- 2. Añade la nueva ruta */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                ) : (
                    <Route path="/*" element={<MainLayout />} />
                )}
            </Routes>
        </Router>
    );
};

export default App;