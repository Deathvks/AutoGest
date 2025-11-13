// autogest-app/frontend/src/pages/Profile.jsx
import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// --- INICIO DE LA MODIFICACIÓN ---
import { faCamera, faTrash, faSave, faTimes, faUser, faEnvelope, faPencilAlt, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
// --- FIN DE LA MODIFICACIÓN ---

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
    // --- INICIO DE LA MODIFICACIÓN ---
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    // --- FIN DE LA MODIFICACIÓN ---

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
            return { text: 'Pro', badgeClass: 'bg-accent', textClass: 'bg-accent/10 text-accent' };
        }
        if (isTrialing) {
            return { text: 'Prueba', badgeClass: 'bg-yellow-accent', textClass: 'bg-yellow-accent/10 text-yellow-accent' };
        }
        return { text: 'Free', badgeClass: 'bg-gray-700', textClass: 'bg-blue-accent/10 text-blue-accent' };
    };
    const statusInfo = getStatusInfo();
        
    const InputField = ({ label, name, value, onChange, type = 'text', icon, disabled }) => (
        <div>
            <label className="block text-sm font-semibold text-text-primary mb-1 uppercase">{label}</label>
            <div className="relative">
                <FontAwesomeIcon icon={icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input 
                    type={type} 
                    name={name} 
                    value={value} 
                    onChange={onChange} 
                    disabled={disabled}
                    className="w-full pl-11 pr-4 py-3 bg-component-bg-hover border rounded-lg focus:ring-1 focus:ring-accent text-text-primary transition-colors border-border-color focus:border-accent disabled:opacity-70 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );

    // --- INICIO DE LA MODIFICACIÓN ---
    return (
        <>
            <div className="max-w-4xl mx-auto">
                <h1 className="hidden lg:block text-3xl font-bold text-text-primary tracking-tight mb-8">MI PERFIL</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <div className="md:col-span-1">
                        <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl border border-border-color shadow-2xl text-center">
                            <div className="relative w-32 h-32 mx-auto group">
                                <img 
                                    src={avatarPreview || (user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${formData.name}&background=1A1629&color=F0EEF7&size=128`)} 
                                    alt="Avatar"
                                    className="w-full h-full rounded-full object-cover border-4 border-border-color shadow-lg cursor-pointer transition-transform hover:scale-105"
                                    onClick={() => setIsAvatarModalOpen(true)}
                                />
                                {isEditing && (
                                    <>
                                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                        <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-1 right-1 bg-accent text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent-hover transition-colors shadow-md border-2 border-component-bg" title="Cambiar avatar">
                                            <FontAwesomeIcon icon={faCamera} size="sm" />
                                        </button>
                                        { (user.avatarUrl || avatarPreview) && (
                                            <button onClick={handleDeleteAvatar} className="absolute top-1 right-1 bg-red-accent text-white w-9 h-9 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity shadow-md border-2 border-component-bg" title="Eliminar avatar">
                                                <FontAwesomeIcon icon={faTrash} size="sm"/>
                                            </button>
                                        )}
                                    </>
                                )}
                                {!isEditing && (
                                    <span className={`absolute bottom-1 right-1 block text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md border-2 border-component-bg ${statusInfo.badgeClass}`}>
                                        {statusInfo.text.toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <div className="mt-4">
                                <h2 className="text-2xl font-bold text-text-primary truncate">{user.name}</h2>
                                <p className="text-sm text-text-secondary truncate">{user.email}</p>
                                <span className={`mt-3 inline-block text-xs font-bold px-3 py-1 rounded-full uppercase ${statusInfo.textClass}`}>{statusInfo.text}</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-component-bg backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-color shadow-2xl h-full">
                            <h3 className="text-lg font-bold text-text-primary mb-6 uppercase">Información de la Cuenta</h3>
                            <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSaveChanges(); }}>
                                <InputField label="Nombre Completo" name="name" value={formData.name} onChange={handleInputChange} icon={faUser} disabled={!isEditing} />
                                <InputField label="Email" name="email" value={formData.email} onChange={handleInputChange} icon={faEnvelope} disabled={!isEditing} />
                                {isEditing ? (
                                    <div className="flex justify-end gap-2 pt-4">
                                        <button type="button" onClick={handleCancel} disabled={isLoading} className="bg-component-bg-hover text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50">
                                            <FontAwesomeIcon icon={faTimes} />
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={isLoading} className="bg-accent text-white px-4 py-2 rounded-lg shadow-md shadow-accent/20 hover:bg-accent-hover transition-opacity flex items-center justify-center gap-2 font-semibold disabled:opacity-50">
                                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faSave} /> Guardar</>}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end pt-4">
                                        <button type="button" onClick={() => setIsEditing(true)} className="bg-component-bg-hover text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors flex items-center justify-center gap-2 font-semibold">
                                            <FontAwesomeIcon icon={faPencilAlt} />
                                            Editar Perfil
                                        </button>
                                    </div>
                                )}
                            </form>
                            
                            {message && <p className="text-sm text-center text-green-accent font-semibold mt-4">{message}</p>}
                            {error && <p className="text-sm text-center text-red-accent font-semibold mt-4">{error}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {isAvatarModalOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[100] p-4 animate-fade-in-up"
                    onClick={() => setIsAvatarModalOpen(false)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[101]"
                        onClick={() => setIsAvatarModalOpen(false)}
                        aria-label="Cerrar"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-8 h-8" />
                    </button>

                    <div
                        className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={avatarPreview || (user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${formData.name}&background=1A1629&color=F0EEF7&size=512`)}
                            alt="Avatar a tamaño completo"
                            className="w-full h-full rounded-full object-cover border-4 border-border-color/50 shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </>
        // --- FIN DE LA MODIFICACIÓN ---
    );
};

export default Profile;