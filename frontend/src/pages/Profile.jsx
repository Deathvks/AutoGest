// autogest-app/frontend/src/pages/Profile.jsx
import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash, faSave, faTimes, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
    const { user, updateUserProfile, deleteUserAvatar, subscriptionStatus } = useContext(AuthContext);

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
            
            if (formData.name !== user.name) {
                data.append('name', formData.name);
            }
            if (formData.email !== user.email) {
                data.append('email', formData.email);
            }

            if (avatarFile) {
                data.append('avatar', avatarFile);
            }

            if (Array.from(data.entries()).length > 0) {
                 await updateUserProfile(data);
            }
           
            setMessage('Perfil actualizado con éxito.');
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
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
    
    const isExempt = user && (user.role === 'admin' || user.role === 'technician');
    const hasValidSubscription = subscriptionStatus === 'active' || 
        (subscriptionStatus === 'cancelled' && user && new Date(user.subscriptionExpiry) > new Date());
        
    const roleStyles = {
        admin: 'bg-red-accent/10 text-red-accent',
        user: 'bg-blue-accent/10 text-blue-accent',
        technician: 'bg-green-accent/10 text-green-accent',
        technician_subscribed: 'bg-accent/10 text-accent'
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-8">MI PERFIL</h1>
            
            <div className="bg-component-bg backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-color shadow-2xl">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <img 
                            src={avatarPreview || (user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${formData.name}&background=1A1629&color=F0EEF7&size=128`)} 
                            alt="Avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-border-color shadow-lg"
                        />
                        {isEditing && (
                            <>
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-1 right-1 bg-accent text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent-hover transition-colors shadow-md border-2 border-component-bg">
                                    <FontAwesomeIcon icon={faCamera} size="sm" />
                                </button>
                                {user.avatarUrl && (
                                     <button onClick={handleDeleteAvatar} className="absolute top-1 right-1 bg-red-accent text-white w-9 h-9 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity shadow-md border-2 border-component-bg">
                                        <FontAwesomeIcon icon={faTrash} size="sm"/>
                                    </button>
                                )}
                            </>
                        )}
                        {!isEditing && !isExempt && (
                            <span className={`absolute -bottom-0.5 -right-0.5 block text-white text-[8px] font-bold px-1 py-0 rounded-md border-2 border-component-bg ${hasValidSubscription ? 'bg-accent' : 'bg-gray-700'}`}>
                                {hasValidSubscription ? 'PRO' : 'FREE'}
                            </span>
                        )}
                    </div>

                    <div className="w-full">
                        {isEditing ? (
                            <div className="space-y-4 max-w-sm mx-auto">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1 uppercase">Nombre Completo</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-11 pr-4 py-2 bg-background/50 border rounded-lg focus:ring-1 focus:ring-accent text-text-primary transition-colors border-border-color focus:border-accent" />
                                    </div>
                                </div>
                                <div>
                                     <label className="block text-sm font-semibold text-text-primary mb-1 uppercase">Email</label>
                                     <div className="relative">
                                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-11 pr-4 py-2 bg-background/50 border rounded-lg focus:ring-1 focus:ring-accent text-text-primary transition-colors border-border-color focus:border-accent" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-text-primary">{user.name}</h2>
                                <p className="text-text-secondary mt-1">{user.email}</p>
                                <span className={`mt-3 inline-block text-xs font-bold px-3 py-1 rounded-full uppercase ${roleStyles[user.role] || 'bg-background'}`}>{user.role.replace('_', ' ')}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border-color flex justify-center gap-4">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="bg-component-bg-hover text-text-primary px-6 py-2 rounded-lg hover:bg-border-color transition-colors flex items-center gap-2 font-semibold">
                                <FontAwesomeIcon icon={faTimes} />
                                Cancelar
                            </button>
                            <button onClick={handleSaveChanges} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity flex items-center gap-2 font-semibold">
                                <FontAwesomeIcon icon={faSave} />
                                Guardar
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-accent text-white px-8 py-2.5 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold">Editar Perfil</button>
                    )}
                </div>
                {message && <p className="text-sm text-center mt-4 text-green-accent font-semibold">{message}</p>}
                {error && <p className="text-sm text-center mt-4 text-red-accent font-semibold">{error}</p>}
            </div>
        </div>
    );
};

export default Profile;