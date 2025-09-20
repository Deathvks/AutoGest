// autogest-app/frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState(true);
    // --- INICIO DE LA MODIFICACIÓN ---
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    // --- FIN DE LA MODIFICACIÓN ---

    useEffect(() => {
        const fetchUserAndSubscription = async () => {
            if (token) {
                try {
                    // Obtenemos los datos del usuario y el estado de la suscripción al mismo tiempo
                    const [userData, subData] = await Promise.all([
                        api.getMe(),
                        api.subscriptions.getSubscriptionStatus()
                    ]);
                    setUser(userData);
                    setSubscriptionStatus(subData.subscriptionStatus);
                } catch (error) {
                    console.error("Token inválido o error al cargar datos, cerrando sesión.", error);
                    logout();
                }
            }
            setIsLoading(false);
        };
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
        // --- INICIO DE LA MODIFICACIÓN ---
        setSubscriptionStatus(null); // Limpiamos el estado de la suscripción
        // --- FIN DE LA MODIFICACIÓN ---
        localStorage.removeItem('authToken');
        window.location.reload();
    };

    const updateUserProfile = async (formData) => {
        try {
            console.log('AuthContext: Enviando actualización de perfil...'); // Debug
            const updatedUser = await api.updateProfile(formData);
            console.log('AuthContext: Usuario actualizado recibido:', updatedUser); // Debug
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error("AuthContext: Error al actualizar el perfil:", error); // Debug mejorado
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
            logout(); // Si la eliminación es exitosa, cerramos la sesión
        } catch (error) {
            console.error("Error al eliminar la cuenta:", error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.register(userData);
            // La función de registro original no establecía el token ni el usuario, lo mantenemos así.
            // El usuario será redirigido al login.
            localStorage.setItem('theme', 'light');
            return response;
        } catch (error) {
            console.error('Error en el registro:', error);
            throw error;
        }
    };

    return (
        // --- INICIO DE LA MODIFICACIÓN ---
        <AuthContext.Provider value={{ token, user, login, logout, isLoading, updateUserProfile, deleteUserAvatar, deleteAccount, subscriptionStatus }}>
        {/* --- FIN DE LA MODIFICACIÓN --- */}
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };