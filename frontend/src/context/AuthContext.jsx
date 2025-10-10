// autogest-app/frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    // --- INICIO DE LA MODIFICACIÓN ---
    const [pendingInvitationToken, setPendingInvitationToken] = useState(null);
    // --- FIN DE LA MODIFICACIÓN ---

    // Función para obtener notificaciones
    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const fetchedNotifications = await api.notifications.getAll();
            setNotifications(fetchedNotifications);
            setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("AuthContext: Failed to fetch notifications:", error);
        }
    }, [token]);

    // Función para marcar notificaciones como leídas
    const markAllNotificationsAsRead = useCallback(async () => {
        if (unreadCount === 0) return;
        const originalNotifications = [...notifications];
        
        setNotifications(current => current.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        
        try {
            await api.notifications.markAllAsRead();
        } catch (err) {
            console.error('AuthContext: Error marking notifications as read:', err);
            setNotifications(originalNotifications);
            setUnreadCount(originalNotifications.filter(n => !n.isRead).length);
        }
    }, [notifications, unreadCount]);

    const fetchUserAndSubscription = useCallback(async () => {
        if (token) {
            try {
                const userData = await api.getMe();
                setUser(userData);
                setSubscriptionStatus(userData.subscriptionStatus);
                await fetchNotifications(); // Se obtienen notificaciones junto al usuario
            } catch (error) {
                console.error("Token inválido o error al cargar datos, cerrando sesión.", error);
                logout();
            }
        }
        if (isAuthLoading) {
            setIsAuthLoading(false);
        }
    }, [token, fetchNotifications]);

    const refreshSubscriptionStatus = async () => {
        setIsRefreshing(true);
        try {
            await fetchUserAndSubscription();
        } finally {
            setIsRefreshing(false);
        }
    };
    
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
    }, [fetchUserAndSubscription]);

    const login = async (email, password) => {
        try {
            const response = await api.login({ email, password });
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                setToken(response.token);
                // --- INICIO DE LA MODIFICACIÓN ---
                if (response.invitationToken) {
                    setPendingInvitationToken(response.invitationToken);
                }
                // --- FIN DE LA MODIFICACIÓN ---
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
        setNotifications([]); // Limpiar notificaciones al salir
        setUnreadCount(0);
        // --- INICIO DE LA MODIFICACIÓN ---
        setPendingInvitationToken(null);
        // --- FIN DE LA MODIFICACIÓN ---
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

    const value = {
        token,
        user,
        login,
        logout,
        register,
        isAuthLoading,
        isRefreshing,
        updateUserProfile,
        deleteUserAvatar,
        deleteAccount,
        subscriptionStatus,
        refreshSubscriptionStatus,
        refreshUser,
        notifications,
        unreadCount,
        markAllNotificationsAsRead,
        fetchNotifications,
        // --- INICIO DE LA MODIFICACIÓN ---
        pendingInvitationToken,
        setPendingInvitationToken,
        // --- FIN DE LA MODIFICACIÓN ---
    };

    return (
        <AuthContext.Provider value={value}>
            {!isAuthLoading && children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };