// autogest-app/frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);

    const fetchUserAndSubscription = async () => {
        if (token) {
            try {
                const userData = await api.getMe();
                setUser(userData);
                setSubscriptionStatus(userData.subscriptionStatus);
            } catch (error) {
                console.error("Token inválido o error al cargar datos, cerrando sesión.", error);
                logout();
            }
        }
        if (isAuthLoading) {
            setIsAuthLoading(false);
        }
    };

    // --- INICIO DE LA MODIFICACIÓN ---
    const refreshSubscriptionStatus = async () => {
        setIsRefreshing(true);
        try {
            // Se asegura de que la obtención de datos se complete antes de continuar
            await fetchUserAndSubscription();
        } finally {
            setIsRefreshing(false);
        }
    };
    // --- FIN DE LA MODIFICACIÓN ---
    
    const refreshUser = async () => {
        if (token) {
            try {
                const userData = await api.getMe();
                setUser(userData);
                setSubscriptionStatus(userData.subscriptionStatus);
            } catch (error) {
                console.error("Error al refrescar el usuario.", error);
            }
        }
    };

    useEffect(() => {
        fetchUserAndSubscription();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.login({ email, password });
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                setToken(response.token);
                return true;
            }
        } catch (error) {
            console.error("Error en el login:", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setSubscriptionStatus(null);
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    };

    const updateUserProfile = async (formData) => {
        try {
            const updatedUser = await api.updateProfile(formData);
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error("AuthContext: Error al actualizar el perfil:", error);
            throw error;
        }
    };
    
    const deleteUserAvatar = async () => {
        try {
            const updatedUser = await api.deleteAvatar();
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error("Error al eliminar el avatar:", error);
            throw error;
        }
    };

    const deleteAccount = async () => {
        try {
            await api.deleteAccount();
            logout();
        } catch (error) {
            console.error("Error al eliminar la cuenta:", error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.register(userData);
            localStorage.setItem('theme', 'light');
            return response;
        } catch (error) {
            console.error('Error en el registro:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthLoading, isRefreshing, updateUserProfile, deleteUserAvatar, deleteAccount, subscriptionStatus, refreshSubscriptionStatus, refreshUser }}>
            {!isAuthLoading && children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };