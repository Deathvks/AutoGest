// autogest-app/frontend/src/components/modals/AddUserModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faEnvelope, faKey, faUserShield } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select'; // Reutilizamos nuestro componente Select
import api from '../../services/api';

// --- Componentes de Formulario ---
const InputField = ({ label, name, value, onChange, type = 'text', icon }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
            </div>
            <input
                type={type} name={name} value={value} onChange={onChange}
                className="w-full pl-10 px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary"
            />
        </div>
    </div>
);

// --- Componente Principal del Modal ---
const AddUserModal = ({ onClose, onUserAdded }) => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user', // Rol por defecto
    });
    const [error, setError] = useState('');

    const roleOptions = [
        { id: 'user', name: 'Usuario' },
        { id: 'admin', name: 'Administrador' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const { name, email, password } = userData;
        const emailRegex = /\S+@\S+\.\S+/;
        if (!name || !email || !password) {
            setError("Todos los campos son obligatorios.");
            return false;
        }
        if (!emailRegex.test(email)) {
            setError("Por favor, introduce un email válido.");
            return false;
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return false;
        }
        setError('');
        return true;
    };

    const handleAddUser = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            const newUser = await api.admin.createUser(userData);
            onUserAdded(newUser); // Llama a la función del padre para actualizar la lista
        } catch (err) {
            setError(err.message || 'Error al crear el usuario.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">Añadir Nuevo Usuario</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="space-y-4">
                        <InputField label="Nombre Completo" name="name" value={userData.name} onChange={handleChange} icon={faUser} />
                        <InputField label="Email" name="email" value={userData.email} onChange={handleChange} type="email" icon={faEnvelope} />
                        <InputField label="Contraseña" name="password" value={userData.password} onChange={handleChange} type="password" icon={faKey} />
                        <Select
                            label="Rol"
                            value={userData.role}
                            onChange={(value) => handleSelectChange('role', value)}
                            options={roleOptions}
                            icon={faUserShield}
                        />
                    </div>
                    {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                </form>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleAddUser} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Añadir Usuario</button>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;