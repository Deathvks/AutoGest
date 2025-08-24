import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const userData = await api.getMe();
                    setUser(userData);
                } catch (error) {
                    console.error("Token inválido, cerrando sesión.", error);
                    logout();
                }
            }
            setIsLoading(false);
        };
        fetchUser();
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
        localStorage.removeItem('authToken');
    };

    const updateUserProfile = async (formData) => {
        try {
            const updatedUser = await api.updateProfile(formData);
            setUser(updatedUser);
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            throw error;
        }
    };

    // --- FUNCIÓN NUEVA ---
    const deleteUserAvatar = async () => {
        try {
            const updatedUser = await api.deleteAvatar();
            setUser(updatedUser); // Actualiza el usuario global con la info sin avatar
        } catch (error) {
            console.error("Error al eliminar el avatar:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isLoading, updateUserProfile, deleteUserAvatar }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };