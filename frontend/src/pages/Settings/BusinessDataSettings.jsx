// frontend/src/pages/Settings/BusinessDataSettings.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faImage, faLock } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const InputField = ({ id, label, value, onChange, disabled, required }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="text"
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="mt-1 block w-full px-3 py-2 bg-component-bg border border-border-color rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:opacity-50"
        />
    </div>
);

const BusinessDataSettings = () => {
    const { user, updateUserProfile, refreshUser } = useContext(AuthContext);
    const [accountType, setAccountType] = useState('empresa');
    const [formData, setFormData] = useState({
        name: '',
        dni: '',
        businessName: '',
        cif: '',
        address: '',
        phone: '',
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const isValidDniNie = (value) => {
        const dniRegex = /^([0-9]{8}[A-Z])$/i;
        const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i;
        value = value.toUpperCase();
        if (!dniRegex.test(value) && !nieRegex.test(value)) return false;
        const controlChars = 'TRWAGMYFPDXBNJZSQVHLCKE';
        let number;
        if (nieRegex.test(value)) {
            const firstChar = value.charAt(0);
            let numPrefix;
            if (firstChar === 'X') numPrefix = '0';
            else if (firstChar === 'Y') numPrefix = '1';
            else if (firstChar === 'Z') numPrefix = '2';
            number = parseInt(numPrefix + value.substring(1, 8), 10);
        } else {
            number = parseInt(value.substring(0, 8), 10);
        }
        return controlChars.charAt(number % 23) === value.charAt(value.length - 1);
    };

    const isValidCif = (value) => {
        value = value.toUpperCase();
        if (!/^[A-Z][0-9]{8}$/.test(value)) return false;
        const controlDigit = value.charAt(value.length - 1);
        const numberPart = value.substring(1, 8);
        let sum = 0;
        for (let i = 0; i < numberPart.length; i++) {
            let num = parseInt(numberPart[i], 10);
            if (i % 2 === 0) {
                num *= 2;
                sum += num < 10 ? num : Math.floor(num / 10) + (num % 10);
            } else {
                sum += num;
            }
        }
        const lastDigitOfSum = sum % 10;
        const calculatedControl = lastDigitOfSum === 0 ? 0 : 10 - lastDigitOfSum;
        
        if (/[A-Z]/.test(controlDigit)) {
            return String.fromCharCode(64 + calculatedControl) === controlDigit;
        } else {
            return calculatedControl === parseInt(controlDigit, 10);
        }
    };

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                dni: user.dni || '',
                businessName: user.businessName || '',
                cif: user.cif || '',
                address: user.address || '',
                phone: user.phone || '',
            });
            setAccountType(user.cif ? 'empresa' : 'particular');
            setLogoPreview(user.logoUrl || null);
        }
    }, [user]);

    const isSubscribed = user?.subscriptionStatus === 'active';
    const isTrialing = user?.trialExpiresAt && new Date(user.trialExpiresAt) > new Date();
    const isLocked = !isSubscribed && isTrialing && user?.role !== 'admin';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, logo: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteLogo = async () => {
        try {
            await api.deleteLogo();
            setLogoPreview(null);
            setSuccessMessage('Logo eliminado con éxito.');
            refreshUser();
        } catch (err) {
            setError('Error al eliminar el logo.');
        }
    };

    // --- INICIO DE LA MODIFICACIÓN ---
    const validateForm = () => {
        const missingFields = [];

        if (!formData.address?.trim()) missingFields.push('Dirección Fiscal');
        if (!formData.phone?.trim()) missingFields.push('Teléfono');

        if (accountType === 'empresa') {
            if (!formData.businessName?.trim()) missingFields.push('Nombre de la Empresa');
            if (!formData.cif?.trim()) {
                missingFields.push('CIF');
            } else if (!isValidCif(formData.cif)) {
                setError('El formato del CIF no es válido.');
                return false;
            }
        } else { // particular
            if (!formData.name?.trim()) missingFields.push('Nombre y Apellidos');
            if (!formData.dni?.trim()) {
                missingFields.push('DNI/NIE');
            } else if (!isValidDniNie(formData.dni)) {
                setError('El formato del DNI/NIE no es válido.');
                return false;
            }
        }

        if (missingFields.length > 0) {
            const fieldsString = missingFields.join(', ');
            setError(`Los siguientes campos son obligatorios: ${fieldsString}.`);
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }
        
        setIsSaving(true);
        
        const data = new FormData();
        
        if (accountType === 'empresa') {
            data.append('businessName', formData.businessName);
            data.append('cif', formData.cif);
            data.append('dni', ''); 
        } else { 
            data.append('name', formData.name);
            data.append('dni', formData.dni);
            data.append('cif', ''); 
        }

        data.append('address', formData.address);
        data.append('phone', formData.phone);
        if (formData.logo) {
            data.append('logo', formData.logo);
        }
    
        try {
            await updateUserProfile(data);
            setSuccessMessage('¡Datos de facturación guardados con éxito!');
        } catch (err) {
            setError(err.message || 'Error al guardar los datos.');
        } finally {
            setIsSaving(false);
        }
    };
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className="bg-component-bg p-6 rounded-lg shadow-md border border-border-color relative">
            {isLocked && (
                <div className="absolute inset-0 bg-component-bg/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                    <FontAwesomeIcon icon={faLock} className="text-4xl text-text-secondary mb-4" />
                    <h3 className="text-xl font-bold text-text-primary">Función Premium</h3>
                    <p className="text-text-secondary mt-1">
                        Añade tus datos de empresa para facturas profesionales.
                    </p>
                    <Link to="/subscription" className="mt-4 bg-accent text-white px-5 py-2 rounded-lg font-semibold hover:bg-accent-hover transition-colors">
                        Suscríbete ahora
                    </Link>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <h2 className="text-xl font-bold text-text-primary border-b border-border-color pb-4">Datos de Facturación</h2>
                
                <div className="relative grid grid-cols-2 w-full max-w-sm mx-auto items-center rounded-full bg-component-bg-hover p-1 border border-border-color">
                    <span
                        className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-[calc(50%-4px)] rounded-full bg-component-bg backdrop-blur-sm shadow-lg transition-transform duration-300 ${
                            accountType === 'particular' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'
                        }`}
                        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    />
                    <button
                        type="button"
                        onClick={() => setAccountType('empresa')}
                        disabled={isLocked}
                        className={`relative z-10 rounded-full py-2 text-xs font-semibold transition-colors duration-300 whitespace-nowrap text-center ${
                            accountType === 'empresa' ? 'text-text-primary' : 'text-text-secondary'
                        }`}
                    >
                        EMPRESA
                    </button>
                    <button
                        type="button"
                        onClick={() => setAccountType('particular')}
                        disabled={isLocked}
                        className={`relative z-10 rounded-full py-2 text-xs font-semibold transition-colors duration-300 whitespace-nowrap text-center ${
                            accountType === 'particular' ? 'text-text-primary' : 'text-text-secondary'
                        }`}
                    >
                        AUTÓNOMO / PARTICULAR
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accountType === 'empresa' ? (
                        <>
                            <InputField id="businessName" label="Nombre de la Empresa" value={formData.businessName} onChange={handleChange} disabled={isLocked} required />
                            <InputField id="cif" label="CIF" value={formData.cif} onChange={handleChange} disabled={isLocked} required />
                        </>
                    ) : (
                        <>
                            <InputField id="name" label="Nombre y Apellidos" value={formData.name} onChange={handleChange} disabled={isLocked} required />
                            <InputField id="dni" label="DNI/NIE" value={formData.dni} onChange={handleChange} disabled={isLocked} required />
                        </>
                    )}
                    <InputField id="address" label="Dirección Fiscal" value={formData.address} onChange={handleChange} disabled={isLocked} required />
                    <InputField id="phone" label="Teléfono" value={formData.phone} onChange={handleChange} disabled={isLocked} required />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Logo de la Empresa</label>
                    <div className="flex items-center gap-4">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo Preview" className="h-16 w-auto rounded-md object-contain bg-white p-1 border border-border-color" />
                        ) : (
                            <div className="h-16 w-16 bg-component-bg-hover border-2 border-dashed border-border-color rounded-md flex items-center justify-center">
                                <FontAwesomeIcon icon={faImage} className="text-text-secondary" />
                            </div>
                        )}
                        <input type="file" id="logo-upload" className="hidden" onChange={handleLogoChange} accept="image/*" disabled={isLocked}/>
                        <label htmlFor="logo-upload" className={`cursor-pointer rounded-md border border-border-color bg-component-bg px-3 py-2 text-sm font-semibold text-text-primary shadow-sm hover:bg-component-bg-hover ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            Cambiar
                        </label>
                        {logoPreview && (
                            <button type="button" onClick={handleDeleteLogo} className={`text-sm font-semibold text-red-500 hover:text-red-700 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isLocked}>
                                <FontAwesomeIcon icon={faTrash} /> Eliminar
                            </button>
                        )}
                    </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}

                <div className="flex justify-end pt-4 border-t border-border-color">
                    <button type="submit" className="bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50" disabled={isSaving || isLocked}>
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BusinessDataSettings;