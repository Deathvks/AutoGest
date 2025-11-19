// autogest-app/frontend/src/pages/Profile.jsx
import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash, faSave, faTimes, faUser, faEnvelope, faPencilAlt, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';

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
    const [isLoading, setIsLoading] = useState(false);
    const avatarInputRef = useRef(null);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

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
        setIsLoading(true);
        try {
            const data = new FormData();
            let hasChanges = false;
            
            if (formData.name !== user.name) {
                data.append('name', formData.name);
                hasChanges = true;
            }
            if (formData.email !== user.email) {
                data.append('email', formData.email);
                hasChanges = true;
            }
            if (avatarFile) {
                data.append('avatar', avatarFile);
                hasChanges = true;
            }

            if (hasChanges) {
                 await updateUserProfile(data);
            }
           
            setMessage('Perfil actualizado con éxito.');
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setError(error.message || 'Error al actualizar el perfil.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteAvatar = async () => {
        setIsLoading(true);
        try {
            await deleteUserAvatar();
            setAvatarPreview(null);
            setMessage('Avatar eliminado con éxito.');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setError(error.message || 'Error al eliminar el avatar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({ name: user?.name || '', email: user?.email || '' });
        setAvatarFile(null);
        setAvatarPreview(null);
        setError('');
        setMessage('');
    };
    
    const isExempt = user && (user.role === 'admin' || user.role === 'technician');
    const hasValidSubscription = subscriptionStatus === 'active' || (subscriptionStatus === 'cancelled' && user && new Date(user.subscriptionExpiry) > new Date());
    const isTrialing = user && user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date() && !hasValidSubscription;

    const getStatusInfo = () => {
        if (isExempt || hasValidSubscription) {
            return { text: 'Pro', badgeClass: 'bg-green-50 text-green-700 border-green-200', borderClass: 'border-green-500' };
        }
        if (isTrialing) {
            return { text: 'Prueba', badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200', borderClass: 'border-yellow-500' };
        }
        return { text: 'Free', badgeClass: 'bg-gray-100 text-gray-700 border-gray-200', borderClass: 'border-gray-400' };
    };
    const statusInfo = getStatusInfo();
        
    const InputField = ({ label, name, value, onChange, type = 'text', icon, disabled }) => (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">{label}</label>
            <div className="relative">
                <FontAwesomeIcon icon={icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type={type} 
                    name={name} 
                    value={value} 
                    onChange={onChange} 
                    disabled={disabled}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 transition-colors placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <h1 className="hidden lg:block text-3xl font-extrabold text-gray-900 tracking-tight mb-8 uppercase">Mi Perfil</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
                            <div className="relative w-32 h-32 mx-auto group">
                                <img 
                                    src={avatarPreview || (user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${formData.name}&background=f3f4f6&color=374151&size=128`)} 
                                    alt="Avatar"
                                    className={`w-full h-full rounded-full object-cover border-4 bg-gray-100 cursor-pointer transition-transform hover:scale-105 ${statusInfo.borderClass} border-opacity-20`}
                                    onClick={() => setIsAvatarModalOpen(true)}
                                />
                                {isEditing && (
                                    <>
                                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                        <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-1 right-1 bg-accent text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent-hover transition-colors shadow-md border-2 border-white" title="Cambiar avatar">
                                            <FontAwesomeIcon icon={faCamera} size="sm" />
                                        </button>
                                        { (user.avatarUrl || avatarPreview) && (
                                            <button onClick={handleDeleteAvatar} className="absolute top-1 right-1 bg-red-600 text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-700 transition-opacity shadow-md border-2 border-white" title="Eliminar avatar">
                                                <FontAwesomeIcon icon={faTrash} size="sm"/>
                                            </button>
                                        )}
                                    </>
                                )}
                                {!isEditing && (
                                    <span className={`absolute bottom-1 right-1 block text-[10px] font-bold px-2 py-0.5 rounded border shadow-sm uppercase ${statusInfo.badgeClass}`}>
                                        {statusInfo.text}
                                    </span>
                                )}
                            </div>

                            <div className="mt-4">
                                <h2 className="text-xl font-bold text-gray-900 truncate">{user.name}</h2>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm h-full">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide border-b border-gray-100 pb-2">Información de la Cuenta</h3>
                            <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSaveChanges(); }}>
                                <InputField label="Nombre Completo" name="name" value={formData.name} onChange={handleInputChange} icon={faUser} disabled={!isEditing} />
                                <InputField label="Email" name="email" value={formData.email} onChange={handleInputChange} icon={faEnvelope} disabled={!isEditing} />
                                {isEditing ? (
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button type="button" onClick={handleCancel} disabled={isLoading} className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50 uppercase">
                                            <FontAwesomeIcon icon={faTimes} />
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={isLoading} className="bg-accent text-white px-6 py-2 rounded-lg shadow hover:bg-accent-hover transition-opacity flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50 uppercase">
                                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faSave} /> Guardar</>}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <button type="button" onClick={() => setIsEditing(true)} className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-bold text-sm uppercase shadow-sm">
                                            <FontAwesomeIcon icon={faPencilAlt} />
                                            Editar Perfil
                                        </button>
                                    </div>
                                )}
                            </form>
                            
                            {message && <p className="text-sm text-center text-green-600 font-bold mt-4 bg-green-50 p-2 rounded border border-green-200">{message}</p>}
                            {error && <p className="text-sm text-center text-red-600 font-bold mt-4 bg-red-50 p-2 rounded border border-red-200">{error}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {isAvatarModalOpen && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                    onClick={() => setIsAvatarModalOpen(false)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[101]"
                        onClick={() => setIsAvatarModalOpen(false)}
                        aria-label="Cerrar"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-10 h-10" />
                    </button>

                    <div
                        className="relative w-full max-w-lg aspect-square"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={avatarPreview || (user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${formData.name}&background=f3f4f6&color=374151&size=512`)}
                            alt="Avatar a tamaño completo"
                            className="w-full h-full object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;