import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { token, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <div>Cargando...</div>; // Muestra un loader mientras se verifica el token
    }

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;