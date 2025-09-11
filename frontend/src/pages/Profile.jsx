// autogest-app/frontend/src/pages/Profile.jsx
import React, { useState, useRef, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash, faUserCircle, faCog } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.PROD ? 'https://auto-gest.es' : 'http://localhost:3001';

const Profile = () => {
    const { user, updateUserProfile, deleteUserAvatar } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user && user.name && user.email && !isInitialized && !isSubmitting) {
            setFormData({ name: user.name, email: user.email });
            setIsInitialized(true);
        }
    }, [user, isInitialized, isSubmitting]);
    
    if (!user) {
        return <div>CARGANDO PERFIL...</div>;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                setError('EL ARCHIVO ES DEMASIADO GRANDE. EL TAMAÑO MÁXIMO PERMITIDO ES 10MB.');
                setTimeout(() => setError(''), 5000);
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('TIPO DE ARCHIVO NO PERMITIDO. SOLO SE ACEPTAN IMÁGENES JPEG, JPG, PNG O WEBP.');
                setTimeout(() => setError(''), 5000);
                return;
            }
            
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setMessage('IMAGEN SELECCIONADA. HAZ CLIC EN "GUARDAR CAMBIOS" PARA CONFIRMAR.');
            setError('');
            
            setTimeout(() => {
                setMessage('');
            }, 3000);
        }
    };

    const handleDeleteAvatar = async () => {
        setMessage('');
        setError('');
        setIsSubmitting(true);
        try {
            await deleteUserAvatar();
            setAvatarFile(null);
            setAvatarPreview('');
            setMessage('FOTO DE PERFIL ELIMINADA.');
            setTimeout(() => {
                setMessage('');
                setIsSubmitting(false);
            }, 3000);
        } catch (err) {
            setError('ERROR AL ELIMINAR LA FOTO.');
            setTimeout(() => {
                setError('');
                setIsSubmitting(false);
            }, 3000);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsSubmitting(true);
    
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        if (avatarFile) {
            data.append('avatar', avatarFile);
        }
    
        try {
            const hadAvatar = !!avatarFile;
            await updateUserProfile(data);
            
            setAvatarFile(null);
            setAvatarPreview('');
            
            const successMessage = hadAvatar ? '¡PERFIL Y FOTO GUARDADOS CON ÉXITO!' : '¡PERFIL ACTUALIZADO CON ÉXITO!';
            setMessage(successMessage);
            
            setTimeout(() => {
                setMessage('');
                setIsSubmitting(false);
            }, 5000);
            
        } catch (err) {
            let errorMessage = 'ERROR DESCONOCIDO';
            if (err.message) {
                if (err.message.includes('demasiado grande')) {
                    errorMessage = 'EL ARCHIVO ES DEMASIADO GRANDE. MÁXIMO 10MB PERMITIDO.';
                } else if (err.message.includes('Tipo de archivo')) {
                    errorMessage = 'SOLO SE PERMITEN IMÁGENES (JPEG, JPG, PNG, WEBP).';
                } else {
                    errorMessage = err.message;
                }
            }
            
            setError(`ERROR AL ACTUALIZAR EL PERFIL: ${errorMessage}`);
            setTimeout(() => {
                setError('');
                setIsSubmitting(false);
            }, 5000);
        }
    };

    const getDisplayAvatarUrl = () => {
        if (avatarPreview) {
            return avatarPreview;
        }
        if (user?.avatarUrl) {
            const baseUrl = user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}${user.avatarUrl}`;
            return `${baseUrl}?t=${Date.now()}`;
        }
        return null;
    };

    const displayAvatarUrl = getDisplayAvatarUrl();

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-8">PERFIL</h1>
            
            <div className="p-6 bg-component-bg rounded-xl border border-border-color">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex flex-col items-center w-24 flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center overflow-hidden">
                            {displayAvatarUrl ? (
                                <img src={displayAvatarUrl} alt="AVATAR" className="h-full w-full object-cover" />
                            ) : (
                                <FontAwesomeIcon icon={faUserCircle} className="text-6xl text-zinc-500 dark:text-zinc-700" />
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                        <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => fileInputRef.current.click()} className="bg-component-bg-hover text-text-secondary rounded-full p-2 hover:bg-border-color transition-colors w-9 h-9 flex items-center justify-center" aria-label="CAMBIAR AVATAR" title="CAMBIAR FOTO">
                                <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                            </button>
                            {displayAvatarUrl && (
                                <button onClick={handleDeleteAvatar} className="bg-red-accent/10 text-red-accent rounded-full p-2 hover:bg-red-accent/20 transition-colors w-9 h-9 flex items-center justify-center" aria-label="ELIMINAR AVATAR" title="ELIMINAR FOTO">
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
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">NOMBRE</label>
                        <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">EMAIL</label>
                        <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary" />
                    </div>
                    <div className="flex justify-end items-center gap-4 min-h-[2rem]">
                        {message && <p className="text-sm text-green-accent font-medium">{message}</p>}
                        {error && <p className="text-sm text-red-accent font-medium">{error}</p>}
                        <button type="submit" className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                            GUARDAR CAMBIOS
                        </button>
                    </div>
                </form>
            </div>

            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            <div className="mt-8 lg:hidden">
                <Link
                    to="/settings"
                    className="w-full flex items-center justify-center gap-3 bg-component-bg text-text-primary font-bold py-3 px-4 rounded-xl border border-border-color hover:bg-component-bg-hover transition-colors"
                >
                    <FontAwesomeIcon icon={faCog} />
                    <span>AJUSTES</span>
                </Link>
            </div>
            {/* --- FIN DE LA MODIFICACIÓN --- */}
        </div>
    );
};

export default Profile;