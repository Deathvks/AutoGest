import React, { useState, useRef, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
    const { user, updateUserProfile, deleteUserAvatar } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email });
            setAvatarPreview(user.avatarUrl);
        }
    }, [user]);
    
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
        }
    };

    const handleDeleteAvatar = async () => {
        try {
            await deleteUserAvatar();
            setAvatarFile(null);
            setAvatarPreview('');
            setMessage('Foto de perfil eliminada.');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error al eliminar la foto.');
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        if (avatarFile) {
            data.append('avatar', avatarFile);
        }

        try {
            await updateUserProfile(data);
            setMessage('¡Perfil actualizado con éxito!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error al actualizar el perfil.');
            console.error(error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-8">Perfil</h1>
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    
                    {/* --- CONTENEDOR DE AVATAR Y BOTONES (MODIFICADO) --- */}
                    <div className="flex flex-col items-center w-24 flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                            {(avatarPreview || user.avatarUrl) ? (
                                <img 
                                    src={avatarPreview || user.avatarUrl} 
                                    alt="Avatar" 
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faUserCircle} className="text-6xl text-slate-400 dark:text-slate-500" />
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                        
                        {/* Botones de acción ahora debajo del avatar */}
                        <div className="flex items-center gap-2 mt-2">
                            <button 
                                onClick={() => fileInputRef.current.click()} 
                                className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full p-2 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors w-9 h-9 flex items-center justify-center"
                                aria-label="Cambiar avatar"
                                title="Cambiar foto"
                            >
                                <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                            </button>
                            {(avatarPreview || user.avatarUrl) && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    className="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 rounded-full p-2 hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors w-9 h-9 flex items-center justify-center"
                                    aria-label="Eliminar avatar"
                                    title="Eliminar foto"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        <p className="mt-2 text-xs font-semibold uppercase text-blue-500">{user.role}</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nombre</label>
                        <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                        <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
                    <div className="flex justify-end items-center gap-4">
                        {message && <p className="text-sm text-emerald-600">{message}</p>}
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;