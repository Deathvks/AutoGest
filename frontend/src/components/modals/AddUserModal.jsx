// autogest-app/frontend/src/components/modals/AddUserModal.jsx
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faEnvelope, faKey, faUserShield, faBuilding, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const InputField = ({ label, name, value, onChange, type = 'text', icon, placeholder = '', disabled = false, required = true }) => (
    <div>
        <label className="block text-sm font-semibold text-text-primary mb-1">
            {label}
            {required && <span className="text-red-accent ml-1">*</span>}
        </label>
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-primary">Añadir Nuevo Usuario</h2>
                <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><FontAwesomeIcon icon={faXmark} className="w-6 h-6" /></button>
            </div>
            <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4">
                <InputField label="Nombre Completo" name="name" value={adminFormData.name} onChange={handleAdminChange} icon={faUser} />
                <InputField label="Email" name="email" value={adminFormData.email} onChange={handleAdminChange} type="email" icon={faEnvelope} />
                <InputField label="Contraseña" name="password" value={adminFormData.password} onChange={handleAdminChange} type="password" icon={faKey} />
                <Select label="Rol" value={adminFormData.role} onChange={(value) => handleAdminSelectChange('role', value)} options={roleOptions} icon={faUserShield} />
            </form>
            <div className="mt-6 flex justify-end gap-4 pt-6 border-t border-border-color">
                <button onClick={onClose} className="bg-component-bg-hover text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold">Cancelar</button>
                <button onClick={handleAdminAddUser} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold">Añadir Usuario</button>
            </div>
        </>
    );

    const renderTechForm = () => (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-primary">Invitar Empleado</h2>
                <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><FontAwesomeIcon icon={faXmark} className="w-6 h-6" /></button>
            </div>
            <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4">
                <p className="text-sm text-text-secondary">Se enviará un enlace de invitación al correo del empleado para que se una a tu equipo.</p>
                <InputField label="Email del Empleado" name="email" value={techFormData.email} onChange={handleTechChange} type="email" icon={faEnvelope} placeholder="empleado@ejemplo.com" />
                <InputField label="Razón Social (Tu Empresa)" name="businessName" value={techFormData.businessName} onChange={handleTechChange} icon={faBuilding} disabled={!!currentUser.businessName} />
            </form>
            <div className="mt-6 flex justify-end gap-4 pt-6 border-t border-border-color">
                <button onClick={onClose} className="bg-component-bg-hover text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold">Cancelar</button>
                <button onClick={handleInviteUser} disabled={isLoading} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold flex items-center gap-2 disabled:opacity-50">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border-color">
                {formToRender}
                {error && <p className="mt-4 text-sm text-red-accent text-center font-semibold">{error}</p>}
                {success && <p className="mt-4 text-sm text-green-accent text-center font-semibold">{success}</p>}
            </div>
        </div>
    );
};

export default AddUserModal;