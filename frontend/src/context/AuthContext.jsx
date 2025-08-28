// autogest-app/frontend/src/context/AuthContext.jsx
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
            return updatedUser; // --- CAMBIO CLAVE: Devolver el usuario actualizado ---
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

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isLoading, updateUserProfile, deleteUserAvatar, deleteAccount }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };