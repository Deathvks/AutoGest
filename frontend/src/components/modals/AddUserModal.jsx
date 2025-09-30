// autogest-app/frontend/src/components/modals/AddUserModal.jsx
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faEnvelope, faKey, faUserShield, faBuilding, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

// --- Componentes de Formulario ---
const InputField = ({ label, name, value, onChange, type = 'text', icon, placeholder = '', disabled = false, required = true }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
            {label}
            {required && <span className="text-red-accent ml-1">*</span>}
        </label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
            </div>
            <input
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
                className="w-full pl-10 px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary disabled:opacity-70 disabled:cursor-not-allowed"
            />
        </div>
    </div>
);

// --- Componente Principal del Modal ---
const AddUserModal = ({ onClose, onUserAdded }) => {
    const { user: currentUser, refreshUser } = useContext(AuthContext);

    // Estado para el formulario de Admin
    const [adminFormData, setAdminFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    
    // Estado para el formulario de Técnico (Invitación)
    const [techFormData, setTechFormData] = useState({ email: '', businessName: '' });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUser && (currentUser.role === 'technician' || currentUser.role === 'technician_subscribed')) {
            setTechFormData(prev => ({ ...prev, businessName: currentUser.businessName || '' }));
        }
    }, [currentUser]);
    
    // --- INICIO DE LA MODIFICACIÓN ---
    const roleOptions = useMemo(() => {
        if (currentUser.role === 'admin') {
            return [
                { id: 'user', name: 'Usuario' },
                { id: 'technician', name: 'Técnico' },
                { id: 'technician_subscribed', name: 'Técnico (con suscripción)' },
                { id: 'admin', name: 'Administrador' },
            ];
        }
        // Para los técnicos, el modal solo muestra la opción de invitar, por lo que no se usan estas opciones.
        return [];
    }, [currentUser.role]);
    // --- FIN DE LA MODIFICACIÓN ---

    // --- Lógica para Administradores ---
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

    // --- Lógica para Técnicos (Invitación) ---
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

    // --- Renderizado Condicional del Modal ---
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
            <div className="mt-6 flex justify-end gap-4">
                <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                <button onClick={handleAdminAddUser} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Añadir Usuario</button>
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
                <p className="text-sm text-text-secondary">Se enviará un enlace de invitación al correo electrónico del empleado para que se una a tu equipo.</p>
                <InputField label="Email del Empleado" name="email" value={techFormData.email} onChange={handleTechChange} type="email" icon={faEnvelope} placeholder="empleado@ejemplo.com" />
                <InputField label="Razón Social (Tu Empresa)" name="businessName" value={techFormData.businessName} onChange={handleTechChange} icon={faBuilding} disabled={!!currentUser.businessName} />
            </form>
            <div className="mt-6 flex justify-end gap-4">
                <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                <button onClick={handleInviteUser} disabled={isLoading} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {isLoading ? 'Enviando...' : 'Enviar Invitación'}
                </button>
            </div>
        </>
    );

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se muestra el formulario de invitación si el rol es 'technician' o 'technician_subscribed'.
    const formToRender = (currentUser.role === 'technician' || currentUser.role === 'technician_subscribed')
        ? renderTechForm()
        : renderAdminForm();
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                {formToRender}
                {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                {success && <p className="mt-4 text-sm text-green-accent text-center">{success}</p>}
            </div>
        </div>
    );
};

export default AddUserModal;