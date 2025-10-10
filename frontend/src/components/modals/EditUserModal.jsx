// autogest-app/frontend/src/components/modals/EditUserModal.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faEnvelope, faKey, faUserShield, faToggleOn, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const InputField = ({ label, name, value, onChange, type = 'text', icon, placeholder, disabled = false }) => (
    <div>
        <label className="block text-sm font-semibold text-text-primary mb-1">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
            </div>
            <input
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
                className="w-full pl-11 px-4 py-2 bg-component-bg-hover border rounded-lg focus:ring-1 focus:border-accent text-text-primary transition-colors border-border-color focus:ring-accent disabled:opacity-70 disabled:cursor-not-allowed placeholder:text-text-secondary"
            />
        </div>
    </div>
);

const ToggleSwitch = ({ label, icon, enabled, onChange, description, disabled = false }) => (
    <div className="bg-background/50 p-4 rounded-xl border border-border-color">
        <div className="flex items-start justify-between">
            <label className="flex items-center text-sm font-semibold text-text-primary">
                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-accent mr-3" />
                {label}
            </label>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onChange}
                    disabled={disabled}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${enabled ? 'bg-accent' : 'bg-component-bg-hover'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`font-semibold text-xs w-6 ${enabled ? 'text-accent' : 'text-text-secondary'}`}>
                    {enabled ? 'SÍ' : 'NO'}
                </span>
            </div>
        </div>
         {description && <p className="text-xs text-text-secondary mt-2 px-1">{description}</p>}
    </div>
);

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
    
    const handleChange = (e) => setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSelectChange = (name, value) => setUserData(prev => ({ ...prev, [name]: value }));

    const handleUpdateUser = async () => {
        setError('');
        try {
            const dataToUpdate = {};
            if (isCurrentUserAdmin) {
                Object.assign(dataToUpdate, {
                    name: userData.name,
                    email: userData.email,
                    role: userData.role
                });
                if (userData.password) {
                    dataToUpdate.password = userData.password;
                }
            } else if (currentUser.isOwner) {
                 Object.assign(dataToUpdate, {
                    canExpelUsers: userData.canExpelUsers
                });
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary">Editar Usuario</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><FontAwesomeIcon icon={faXmark} className="w-6 h-6" /></button>
                </div>

                <form onSubmit={(e) => e.preventDefault()} noValidate className="p-6 space-y-4">
                    <InputField label="Nombre Completo" name="name" value={userData.name} onChange={handleChange} icon={faUser} disabled={!isCurrentUserAdmin} />
                    <InputField label="Email" name="email" value={userData.email} onChange={handleChange} type="email" icon={faEnvelope} disabled={!isCurrentUserAdmin} />
                    
                    {isCurrentUserAdmin && (
                        <>
                            <InputField label="Nueva Contraseña (opcional)" name="password" value={userData.password} onChange={handleChange} type="password" icon={faKey} placeholder="Dejar en blanco para no cambiar" />
                            <Select label="Rol" value={userData.role} onChange={(value) => handleSelectChange('role', value)} options={roleOptions} icon={faUserShield} />
                        </>
                    )}

                    {currentUser.isOwner && !isCurrentUserAdmin && !isEditingSelf && (
                        <div className="pt-4 border-t border-border-color space-y-4">
                            <ToggleSwitch
                                label="Expulsar Miembros"
                                icon={faUserSlash}
                                enabled={userData.canExpelUsers}
                                onChange={() => setUserData(prev => ({ ...prev, canExpelUsers: !prev.canExpelUsers }))}
                                description="Permite expulsar a otros miembros del equipo."
                            />
                        </div>
                    )}
                    
                    {error && <p className="mt-4 text-sm text-red-accent text-center font-semibold">{error}</p>}
                </form>
                
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3 p-4 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    <div className="w-full sm:w-auto">
                        {(currentUser.isOwner || currentUser.canExpelUsers) && !isCurrentUserAdmin && !isEditingSelf && (
                            <button onClick={handleExpelClick} className="w-full bg-red-accent/10 text-red-accent px-4 py-2 rounded-lg hover:bg-red-accent/20 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon={faUserSlash} />
                                Expulsar
                            </button>
                        )}
                    </div>
                    <div className="w-full sm:w-auto flex items-center gap-3">
                        <button onClick={onClose} className="w-full sm:w-auto bg-component-bg border border-border-color text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold">Cancelar</button>
                        <button onClick={handleUpdateUser} disabled={isEditingSelf && !isCurrentUserAdmin} className="w-full sm:w-auto bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;