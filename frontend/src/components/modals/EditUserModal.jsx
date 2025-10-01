// autogest-app/frontend/src/components/modals/EditUserModal.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faEnvelope, faKey, faUserShield, faToggleOn, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

// --- Componentes de Formulario ---
const InputField = ({ label, name, value, onChange, type = 'text', icon, placeholder, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
            </div>
            <input
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
                className="w-full pl-10 px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    </div>
);

const ToggleSwitch = ({ label, icon, enabled, onChange, description, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <div className="flex items-start gap-4 mt-2">
            <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary mt-1" />
            <div className="flex-grow">
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={onChange}
                        disabled={disabled}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${enabled ? 'bg-accent' : 'bg-zinc-200 dark:bg-zinc-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`ml-3 font-semibold ${enabled ? 'text-accent' : 'text-text-secondary'}`}>
                        {enabled ? 'SÍ' : 'NO'}
                    </span>
                </div>
                {description && <p className="text-xs text-text-secondary mt-1">{description}</p>}
            </div>
        </div>
    </div>
);


// --- Componente Principal del Modal ---
const EditUserModal = ({ user, onClose, onUserUpdated, onExpelUser }) => {
    const { user: currentUser } = useContext(AuthContext);
    const [userData, setUserData] = useState({
        name: '', email: '', role: 'user', password: '',
        canManageRoles: false, canExpelUsers: false,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name, email: user.email, role: user.role, password: '',
                canManageRoles: user.canManageRoles || false,
                canExpelUsers: user.canExpelUsers || false,
            });
        }
    }, [user]);

    const roleOptions = useMemo(() => {
        if (currentUser.role === 'admin') {
            return [ 
                { id: 'user', name: 'Usuario' }, 
                { id: 'admin', name: 'Administrador' }, 
                { id: 'technician', name: 'Técnico' }, 
                { id: 'technician_subscribed', name: 'Técnico (requiere suscripción)' }, 
            ];
        }
        if (currentUser.role === 'technician' || currentUser.role === 'technician_subscribed') {
            const baseOptions = [
                { id: 'user', name: 'Usuario' }, 
                { id: 'technician_subscribed', name: 'Técnico (con suscripción)' }
            ];
            if (currentUser.role === 'technician') {
                baseOptions.push({ id: 'technician', name: 'Técnico' });
            }
            return baseOptions;
        }
        return [{ id: 'user', name: 'Usuario' }];
    }, [currentUser.role]);

    const isEditingSelf = currentUser.id === user.id;
    const isCurrentUserAdmin = currentUser.role === 'admin';
    const isCurrentUserTechnician = currentUser.role === 'technician' || currentUser.role === 'technician_subscribed';
    
    const canTechnicianEditMember = isCurrentUserTechnician && (currentUser.isOwner || currentUser.canManageRoles) && !isEditingSelf;
    
    const handleChange = (e) => setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSelectChange = (name, value) => setUserData(prev => ({ ...prev, [name]: value }));

    const handleUpdateUser = async () => {
        setError('');
        try {
            const dataToUpdate = {};
            if (isCurrentUserAdmin) {
                Object.assign(dataToUpdate, userData);
                if (!userData.password) {
                    delete dataToUpdate.password;
                }
            } else if (canTechnicianEditMember) {
                dataToUpdate.canExpelUsers = userData.canExpelUsers;
            }

            if (Object.keys(dataToUpdate).length === 0) {
                onClose();
                return;
            }
            
            const updatedUser = await api.admin.updateUser(user.id, dataToUpdate);
            onUserUpdated(updatedUser);
        } catch (err) {
            setError(err.message || 'Error al actualizar el usuario.');
        }
    };
    
    const handleExpelClick = () => {
        onClose();
        onExpelUser(user);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">Editar Usuario</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><FontAwesomeIcon icon={faXmark} className="w-6 h-6" /></button>
                </div>

                <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4">
                    {isCurrentUserAdmin ? (
                        <>
                            <InputField label="Nombre Completo" name="name" value={userData.name} onChange={handleChange} icon={faUser} />
                            <InputField label="Email" name="email" value={userData.email} onChange={handleChange} type="email" icon={faEnvelope} />
                            <InputField label="Nueva Contraseña (opcional)" name="password" value={userData.password} onChange={handleChange} type="password" icon={faKey} placeholder="Dejar en blanco para no cambiar" />
                            <Select label="Rol" value={userData.role} onChange={(value) => handleSelectChange('role', value)} options={roleOptions} icon={faUserShield} />
                        </>
                    ) : canTechnicianEditMember ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Nombre Completo</label>
                                <p className="w-full pl-10 px-3 py-2 bg-background border border-border-color rounded-lg text-text-primary relative">
                                    <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                                    {userData.name}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-border-color space-y-4">
                               <ToggleSwitch
                                   label="Permiso para Expulsar Miembros"
                                   icon={faUserSlash}
                                   enabled={userData.canExpelUsers}
                                   onChange={() => setUserData(prev => ({ ...prev, canExpelUsers: !prev.canExpelUsers }))}
                                   description="Permitir a este miembro expulsar a otros del equipo."
                               />
                           </div>
                        </>
                    ) : (
                         <p className="text-sm text-text-secondary text-center">No tienes permisos para editar este usuario.</p>
                    )}
                    {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                </form>
                
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3">
                    <div className="w-full sm:w-auto">
                        {canTechnicianEditMember && (currentUser.isOwner || currentUser.canExpelUsers) && (
                            <button onClick={handleExpelClick} className="w-full justify-center bg-red-accent/10 text-red-accent px-4 py-2 rounded-lg hover:bg-red-accent/20 transition-colors text-sm font-medium flex items-center gap-2">
                                <FontAwesomeIcon icon={faUserSlash} />
                                Expulsar
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button onClick={onClose} className="w-full sm:w-auto bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                        <button onClick={handleUpdateUser} disabled={isEditingSelf || (!isCurrentUserAdmin && !canTechnicianEditMember)} className="w-full sm:w-auto bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                            Guardar Cambios
                        </button>
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;