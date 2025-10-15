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
    const [pendingInvitationToken, setPendingInvitationToken] = useState(null);
    const [promptTrial, setPromptTrial] = useState(false);

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
                await fetchNotifications();

                if (userData && userData.companyId) {
                    setPendingInvitationToken(null);
                }

            } catch (error) {
                console.error("Token inválido o error al cargar datos, cerrando sesión.", error);
                logout();
            }
        }
        if (isAuthLoading) {
            setIsAuthLoading(false);
        }
    }, [token, fetchNotifications, isAuthLoading]);

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
                if (response.invitationToken) {
                    const handledTokens = JSON.parse(localStorage.getItem('handledInvitationTokens') || '[]');
                    if (!handledTokens.includes(response.invitationToken)) {
                        setPendingInvitationToken(response.invitationToken);
                    }
                }
                if (response.promptTrial) {
                    setPromptTrial(true);
                }
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
        setNotifications([]);
        setUnreadCount(0);
        setPendingInvitationToken(null);
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

    const startTrial = async () => {
        try {
            const updatedUser = await api.startTrial();
            setUser(updatedUser);
            setPromptTrial(false);
            // --- INICIO DE LA MODIFICACIÓN ---
            // Recargar la página para asegurar que todos los componentes se actualicen con el nuevo estado de prueba
            window.location.reload();
            // --- FIN DE LA MODIFICACIÓN ---
        } catch (error) {
            console.error("Error al iniciar el período de prueba:", error);
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
        setNotifications, 
        unreadCount,
        setUnreadCount, 
        markAllNotificationsAsRead,
        fetchNotifications,
        pendingInvitationToken,
        setPendingInvitationToken,
        promptTrial,
        startTrial,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isAuthLoading && children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };