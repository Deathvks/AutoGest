// autogest-app/frontend/src/pages/Profile.jsx
import React, { useState, useRef, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash, faUserCircle } from '@fortawesome/free-solid-svg-icons';

// --- NUEVA FUNCIÓN AUXILIAR ---
// Define la URL base del backend para que las imágenes se carguen correctamente
// tanto en desarrollo como en producción.
const API_BASE_URL = import.meta.env.PROD ? 'https://auto-gest.es' : 'http://localhost:3001';

const Profile = () => {
    const { user, updateUserProfile, deleteUserAvatar } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const fileInputRef = useRef(null);
    const messageTimeoutRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email });
            if (avatarPreview && !user.avatarUrl) {
                setAvatarPreview('');
            }
        }
    }, [user]);
    
    // Efecto para manejar el mensaje de éxito
    useEffect(() => {
        if (showSuccessMessage) {
            setMessage('Aplicado con éxito');
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
            messageTimeoutRef.current = setTimeout(() => {
                setMessage('');
                setShowSuccessMessage(false);
            }, 4000);
        }
        
        return () => {
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
        };
    }, [showSuccessMessage]);
    
    if (!user) {
        return <div>Cargando perfil...</div>;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            // Mostrar mensaje de confirmación al seleccionar una foto
            setMessage('Foto de perfil seleccionada. Haz clic en "Guardar Cambios" para confirmar.');
            setError('');
            // Limpiar el mensaje después de 5 segundos
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleDeleteAvatar = async () => {
        setMessage('');
        setError('');
        try {
            await deleteUserAvatar();
            setAvatarFile(null);
            setAvatarPreview(''); // Aseguramos que la vista previa se limpie
            setMessage('Foto de perfil eliminada.');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setError('Error al eliminar la foto.');
            setTimeout(() => setError(''), 3000);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setShowSuccessMessage(false);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        if (avatarFile) {
            data.append('avatar', avatarFile);
        }

        try {
            await updateUserProfile(data);
            setAvatarFile(null);
            setShowSuccessMessage(true); // Activar el mensaje de éxito
        } catch (error) {
            setError('Error al actualizar el perfil.');
            console.error(error);
            setTimeout(() => setError(''), 3000);
        }
    };

    // --- LÓGICA MEJORADA PARA MOSTRAR LA IMAGEN ---
    // Construye la URL completa si es una ruta relativa del backend.
    // Si es una vista previa local (blob:...), la usa directamente.
    const getDisplayAvatarUrl = () => {
        if (avatarPreview) {
            return avatarPreview;
        }
        if (user && user.avatarUrl) {
            // Si la URL ya es completa, la usa. Si no, le añade la base.
            return user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}${user.avatarUrl}`;
        }
        return null;
    };

    const displayAvatarUrl = getDisplayAvatarUrl();

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-8">Perfil</h1>
            <div className="p-6 bg-component-bg rounded-xl border border-border-color">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    
                    <div className="flex flex-col items-center w-24 flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center overflow-hidden">
                            {displayAvatarUrl ? (
                                <img 
                                    src={displayAvatarUrl} 
                                    alt="Avatar" 
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faUserCircle} className="text-6xl text-zinc-500 dark:text-zinc-700" />
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                        
                        <div className="flex items-center gap-2 mt-2">
                            <button 
                                onClick={() => fileInputRef.current.click()} 
                                className="bg-component-bg-hover text-text-secondary rounded-full p-2 hover:bg-border-color transition-colors w-9 h-9 flex items-center justify-center"
                                aria-label="Cambiar avatar"
                                title="Cambiar foto"
                            >
                                <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                            </button>
                            {displayAvatarUrl && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    className="bg-red-accent/10 text-red-accent rounded-full p-2 hover:bg-red-accent/20 transition-colors w-9 h-9 flex items-center justify-center"
                                    aria-label="Eliminar avatar"
                                    title="Eliminar foto"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-bold text-text-primary">{user.name}</h2>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                        <p className="mt-2 text-xs font-semibold uppercase text-blue-accent">{user.role}</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t border-border-color pt-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Nombre</label>
                        <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                        <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary" />
                    </div>
                    
                    <div className="flex flex-col items-center gap-4 mt-6">
                        <button type="submit" className="bg-blue-accent text-white px-6 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Guardar Cambios</button>
                        <div className="min-h-[20px] flex justify-center">
                            {message && <p className="text-sm text-green-accent text-center">{message}</p>}
                            {error && <p className="text-sm text-red-accent text-center">{error}</p>}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;