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
            return { text: 'Pro', badgeClass: 'bg-[#DCFCE7] text-[#16A34A]', borderClass: 'border-[#16A34A]' };
        }
        if (isTrialing) {
            return { text: 'Prueba', badgeClass: 'bg-yellow-100 text-yellow-700', borderClass: 'border-yellow-400' };
        }
        return { text: 'Free', badgeClass: 'bg-[#F2F4F8] text-[#6B7280]', borderClass: 'border-[#E5E7EB]' };
    };
    const statusInfo = getStatusInfo();

    const InputField = ({ label, name, value, onChange, type = 'text', icon, disabled }) => (
        <div className="mb-4">
            <label className="block text-[13px] font-medium text-[#6B7280] mb-1.5">{label}</label>
            <div className="relative">
                <FontAwesomeIcon icon={icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full pl-[42px] pr-4 py-[14px] bg-[#F2F4F8] border border-transparent rounded-[14px] text-[15px] text-[#06122A] focus:bg-white focus:border-[#020B1C] transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );

    return (
        <>
            <div className="max-w-4xl mx-auto p-4 sm:p-0">
                <h1 className="hidden lg:block text-2xl font-bold text-[#06122A] mb-6">Mi Perfil</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-[20px] border border-[#E5E7EB] text-center">
                            <div className="relative w-28 h-28 mx-auto group">
                                <img
                                    src={avatarPreview || (user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${formData.name}&background=F2F4F8&color=06122A&size=128`)}
                                    alt="Avatar"
                                    className={`w-full h-full rounded-full object-cover border-4 bg-[#F2F4F8] cursor-pointer transition-transform hover:scale-105 ${statusInfo.borderClass} border-opacity-30`}
                                    onClick={() => setIsAvatarModalOpen(true)}
                                />
                                {isEditing && (
                                    <>
                                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                        <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-0 right-0 bg-[#020B1C] text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#06122A] transition-colors border-2 border-white" title="Cambiar avatar">
                                            <FontAwesomeIcon icon={faCamera} size="sm" />
                                        </button>
                                        {(user.avatarUrl || avatarPreview) && (
                                            <button onClick={handleDeleteAvatar} className="absolute top-0 right-0 bg-[#DC2626] text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-700 transition-colors border-2 border-white" title="Eliminar avatar">
                                                <FontAwesomeIcon icon={faTrash} size="sm" />
                                            </button>
                                        )}
                                    </>
                                )}
                                {!isEditing && (
                                    <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 block text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-white shadow-sm ${statusInfo.badgeClass}`}>
                                        {statusInfo.text}
                                    </span>
                                )}
                            </div>

                            <div className="mt-6">
                                <h2 className="text-xl font-bold text-[#06122A] truncate">{user.name}</h2>
                                <p className="text-[15px] text-[#6B7280] mt-1 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-white p-6 rounded-[20px] border border-[#E5E7EB] h-full">
                            <h3 className="text-lg font-bold text-[#06122A] mb-5">Información de la Cuenta</h3>
                            <form onSubmit={e => { e.preventDefault(); handleSaveChanges(); }}>
                                <InputField label="Nombre Completo" name="name" value={formData.name} onChange={handleInputChange} icon={faUser} disabled={!isEditing} />
                                <InputField label="Email" name="email" value={formData.email} onChange={handleInputChange} icon={faEnvelope} disabled={!isEditing} />

                                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                                    {isEditing ? (
                                        <div className="flex justify-end gap-3">
                                            <button type="button" onClick={handleCancel} disabled={isLoading} className="px-5 py-[14px] rounded-[14px] border border-[#E5E7EB] text-[#06122A] hover:bg-[#F2F4F8] transition-colors flex items-center justify-center gap-2 font-medium text-[15px] disabled:opacity-50">
                                                <FontAwesomeIcon icon={faTimes} />
                                                Cancelar
                                            </button>
                                            <button type="submit" disabled={isLoading} className="bg-[#020B1C] text-white px-6 py-[14px] rounded-[14px] hover:bg-[#06122A] transition-colors flex items-center justify-center gap-2 font-medium text-[15px] disabled:opacity-50">
                                                {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faSave} /> Guardar</>}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end">
                                            <button type="button" onClick={() => setIsEditing(true)} className="px-6 py-[14px] rounded-[14px] border border-[#E5E7EB] text-[#06122A] hover:bg-[#F2F4F8] transition-colors flex items-center justify-center gap-2 font-medium text-[15px]">
                                                <FontAwesomeIcon icon={faPencilAlt} className="text-[#6B7280]" />
                                                Editar Perfil
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>

                            {message && <p className="text-[14px] text-center text-[#16A34A] font-medium mt-4 bg-[#DCFCE7] p-3 rounded-[10px]">{message}</p>}
                            {error && <p className="text-[14px] text-center text-[#DC2626] font-medium mt-4 bg-[#FEE2E2] p-3 rounded-[10px]">{error}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {isAvatarModalOpen && (
                <div
                    className="fixed inset-0 bg-[#020B1C]/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity"
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
                        className="relative w-full max-w-lg aspect-square"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={avatarPreview || (user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${formData.name}&background=F2F4F8&color=06122A&size=512`)}
                            alt="Avatar a tamaño completo"
                            className="w-full h-full object-contain rounded-[20px]"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;