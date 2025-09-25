// autogest-app/frontend/src/pages/Profile.jsx
import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const Profile = () => {
    const { user, updateUserProfile, deleteUserAvatar } = useContext(AuthContext);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const avatarInputRef = React.useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError('La imagen no puede pesar más de 10MB.');
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveChanges = async () => {
        setMessage('');
        setError('');
        try {
            const data = new FormData();
            
            // Solo añadir los campos que han cambiado
            if (formData.name !== user.name) {
                data.append('name', formData.name);
            }
            if (formData.email !== user.email) {
                data.append('email', formData.email);
            }

            if (avatarFile) {
                data.append('avatar', avatarFile);
            }

            // Si no hay cambios, no hacer la llamada a la API
            if (!data.entries().next().done) {
                 await updateUserProfile(data);
            }
           
            setMessage('Perfil actualizado con éxito.');
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null); // Limpiar preview para que muestre la nueva imagen de `user`
        } catch (error) {
            setError(error.message || 'Error al actualizar el perfil.');
        }
    };
    
    const handleDeleteAvatar = async () => {
        try {
            await deleteUserAvatar();
            setAvatarPreview(null);
            setMessage('Avatar eliminado con éxito.');
        } catch (error) {
            setError(error.message || 'Error al eliminar el avatar.');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
        });
        setAvatarFile(null);
        setAvatarPreview(null);
        setError('');
        setMessage('');
    };

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-8">MI PERFIL</h1>
            
            <div className="bg-component-bg p-6 rounded-xl border border-border-color shadow-sm">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <img 
                            src={avatarPreview || (user.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : `https://ui-avatars.com/api/?name=${formData.name}&background=B8860B&color=fff&size=128`)} 
                            alt="Avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-border-color"
                        />
                        {isEditing && (
                            <>
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-1 right-1 bg-accent text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent-hover transition-colors shadow-md">
                                    <FontAwesomeIcon icon={faCamera} size="sm" />
                                </button>
                                {user.avatarUrl && (
                                     <button onClick={handleDeleteAvatar} className="absolute top-1 right-1 bg-red-accent text-white w-8 h-8 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity shadow-md">
                                        <FontAwesomeIcon icon={faTrash} size="sm"/>
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="w-full">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Nombre Completo</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-accent" />
                                </div>
                                <div>
                                     <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-accent" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-text-primary">{user.name}</h2>
                                <p className="text-text-secondary">{user.email}</p>
                                <span className={`mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full ${user.role === 'admin' ? 'bg-red-accent/10 text-red-accent' : 'bg-blue-accent/10 text-blue-accent'}`}>{user.role}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border-color flex justify-end gap-4">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors flex items-center gap-2">
                                <FontAwesomeIcon icon={faTimes} />
                                Cancelar
                            </button>
                            <button onClick={handleSaveChanges} className="bg-accent text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-2">
                                <FontAwesomeIcon icon={faSave} />
                                Guardar Cambios
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-accent text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent-hover transition-colors">Editar Perfil</button>
                    )}
                </div>
                {message && <p className="text-sm text-center mt-4 text-green-accent">{message}</p>}
                {error && <p className="text-sm text-center mt-4 text-red-accent">{error}</p>}
            </div>
        </div>
    );
};

export default Profile;