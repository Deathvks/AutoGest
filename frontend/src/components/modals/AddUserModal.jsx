// autogest-app/frontend/src/components/modals/AddUserModal.jsx
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faEnvelope, faKey, faUserShield, faBuilding, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const InputField = ({ label, name, value, onChange, type = 'text', icon, placeholder = '', disabled = false, required = true }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" />
            </div>
            <input
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
                className="w-full pl-11 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
        </div>
    </div>
);

const AddUserModal = ({ onClose, onUserAdded }) => {
    const { user: currentUser, refreshUser } = useContext(AuthContext);

    const [adminFormData, setAdminFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [techFormData, setTechFormData] = useState({ email: '', businessName: '' });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUser && (currentUser.role === 'technician' || currentUser.role === 'technician_subscribed')) {
            setTechFormData(prev => ({ ...prev, businessName: currentUser.businessName || '' }));
        }
    }, [currentUser]);
    
    const roleOptions = useMemo(() => {
        if (currentUser.role === 'admin') {
            return [
                { id: 'user', name: 'Usuario' },
                { id: 'technician', name: 'Técnico' },
                { id: 'technician_subscribed', name: 'Técnico (con suscripción)' },
                { id: 'admin', name: 'Administrador' },
            ];
        }
        return [];
    }, [currentUser.role]);

    const handleAdminChange = (e) => {
        const { name, value } = e.target;
        setAdminFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleAdminSelectChange = (name, value) => {
        setAdminFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleAdminAddUser = async () => {
        setError('');
        const { name, email, password } = adminFormData;
        if (!name || !email || !password) return setError("Todos los campos son obligatorios.");
        if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
        
        try {
            const newUser = await api.admin.createUser(adminFormData);
            onUserAdded(newUser);
        } catch (err) {
            setError(err.message || 'Error al crear el usuario.');
        }
    };

    const handleTechChange = (e) => {
        const { name, value } = e.target;
        setTechFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleInviteUser = async () => {
        setError('');
        setSuccess('');
        if (!techFormData.email) return setError("El email del empleado es obligatorio.");
        if (!techFormData.businessName && !currentUser.businessName) return setError("La razón social es obligatoria para enviar la primera invitación.");
        
        setIsLoading(true);
        try {
            await api.company.inviteUser(techFormData);
            
            if (!currentUser.businessName && techFormData.businessName) {
                await api.updateProfile({ businessName: techFormData.businessName });
                await refreshUser();
            }
            
            setSuccess(`Invitación enviada a ${techFormData.email}.`);
            setTimeout(() => {
                onClose();
            }, 2500);

        } catch (err) {
            setError(err.message || 'Error al enviar la invitación.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderAdminForm = () => (
        <>
            <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white rounded-t-lg">
                <h2 className="text-lg font-bold uppercase tracking-wide">Añadir Nuevo Usuario</h2>
                <button 
                    onClick={onClose} 
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                >
                    <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                </button>
            </div>
            <form onSubmit={(e) => e.preventDefault()} noValidate className="p-6 space-y-4 bg-white">
                <InputField label="Nombre Completo" name="name" value={adminFormData.name} onChange={handleAdminChange} icon={faUser} />
                <InputField label="Email" name="email" value={adminFormData.email} onChange={handleAdminChange} type="email" icon={faEnvelope} />
                <InputField label="Contraseña" name="password" value={adminFormData.password} onChange={handleAdminChange} type="password" icon={faKey} />
                <Select label="Rol" value={adminFormData.role} onChange={(value) => handleAdminSelectChange('role', value)} options={roleOptions} icon={faUserShield} />
            </form>
            <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm">Cancelar</button>
                <button onClick={handleAdminAddUser} className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm">Añadir Usuario</button>
            </div>
        </>
    );

    const renderTechForm = () => (
        <>
            <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white rounded-t-lg">
                <h2 className="text-lg font-bold uppercase tracking-wide">Invitar Empleado</h2>
                <button 
                    onClick={onClose} 
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                >
                    <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                </button>
            </div>
            <form onSubmit={(e) => e.preventDefault()} noValidate className="p-6 space-y-4 bg-white">
                <p className="text-sm text-gray-600 mb-2">Se enviará un enlace de invitación al correo del empleado para que se una a tu equipo.</p>
                <InputField label="Email del Empleado" name="email" value={techFormData.email} onChange={handleTechChange} type="email" icon={faEnvelope} placeholder="empleado@ejemplo.com" />
                <InputField label="Razón Social (Tu Empresa)" name="businessName" value={techFormData.businessName} onChange={handleTechChange} icon={faBuilding} disabled={!!currentUser.businessName} />
            </form>
            <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm">Cancelar</button>
                <button onClick={handleInviteUser} disabled={isLoading} className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm flex items-center gap-2 disabled:opacity-50">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {isLoading ? 'Enviando...' : 'Enviar Invitación'}
                </button>
            </div>
        </>
    );

    const formToRender = (currentUser.role === 'technician' || currentUser.role === 'technician_subscribed')
        ? renderTechForm()
        : renderAdminForm();

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col border border-gray-300">
                {formToRender}
                {error && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold uppercase rounded-r mx-6 mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-green-50 border-l-4 border-green-600 text-green-700 text-sm font-bold uppercase rounded-r mx-6 mb-4">
                        {success}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddUserModal;