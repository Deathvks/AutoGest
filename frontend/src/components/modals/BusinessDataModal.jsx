// autogest-app/frontend/src/components/modals/BusinessDataModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faBuilding, faIdCard, faFileInvoice, faPhone, faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';

const InputField = ({ label, name, value, onChange, icon, required = false }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" />
                </div>
            )}
            <input
                type="text" name={name} value={value || ''} onChange={onChange}
                className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 transition-colors placeholder:text-gray-400 ${icon ? 'pl-11' : ''}`}
            />
        </div>
    </div>
);

const BusinessDataModal = ({ isOpen, onClose, onSave }) => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({});
    const [accountType, setAccountType] = useState('empresa');
    const [error, setError] = useState('');

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
        if (user && isOpen) {
            const hasBillingDetails = user.dni || user.cif;
            const isCompany = !!user.cif;

            setFormData({
                businessName: hasBillingDetails ? user.businessName || '' : '',
                name: hasBillingDetails ? user.name || '' : '',
                dni: user.dni || '',
                cif: user.cif || '',
                streetAddress: isCompany ? (user.companyStreetAddress || '') : (user.personalStreetAddress || ''),
                postalCode: isCompany ? (user.companyPostalCode || '') : (user.personalPostalCode || ''),
                city: isCompany ? (user.companyCity || '') : (user.personalCity || ''),
                province: isCompany ? (user.companyProvince || '') : (user.personalProvince || ''),
                phone: isCompany ? (user.companyPhone || '') : (user.personalPhone || user.phone || ''),
            });
            setAccountType(isCompany ? 'empresa' : 'particular');
            setError('');
        }
    }, [user, isOpen]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const validateForm = () => {
        if (!formData.streetAddress?.trim() || !formData.postalCode?.trim() || !formData.city?.trim() || !formData.province?.trim() || !formData.phone?.trim()) {
            setError('Todos los campos de dirección y teléfono son obligatorios.');
            return false;
        }
        if (accountType === 'empresa') {
            if (!formData.businessName?.trim() || !formData.cif?.trim()) {
                setError('La razón social y el CIF son obligatorios para empresas.');
                return false;
            }
            if (!isValidCif(formData.cif)) {
                setError('El formato del CIF no es válido.');
                return false;
            }
        } else {
            if (!formData.name?.trim() || !formData.dni?.trim()) {
                setError('El nombre y el DNI/NIE son obligatorios.');
                return false;
            }
            if (!isValidDniNie(formData.dni)) {
                setError('El formato del DNI/NIE no es válido.');
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleConfirmSave = async () => {
        if (!validateForm()) {
            return;
        }

        const dataToSave = new FormData();
        dataToSave.append('email', user.email);
        
        if (accountType === 'empresa') {
            dataToSave.append('businessName', formData.businessName);
            dataToSave.append('cif', formData.cif);
            dataToSave.append('name', user.name); 
            dataToSave.append('dni', '');
            dataToSave.append('companyStreetAddress', formData.streetAddress);
            dataToSave.append('companyPostalCode', formData.postalCode);
            dataToSave.append('companyCity', formData.city);
            dataToSave.append('companyProvince', formData.province);
            dataToSave.append('companyPhone', formData.phone);

        } else {
            dataToSave.append('name', formData.name);
            dataToSave.append('dni', formData.dni);
            dataToSave.append('businessName', formData.name);
            dataToSave.append('cif', '');
            dataToSave.append('personalStreetAddress', formData.streetAddress);
            dataToSave.append('personalPostalCode', formData.postalCode);
            dataToSave.append('personalCity', formData.city);
            dataToSave.append('personalProvince', formData.province);
            dataToSave.append('personalPhone', formData.phone);
        }

        try {
            await onSave(dataToSave);
        } catch (err) {
            setError(err.message || 'Error al guardar los datos.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-300 overflow-hidden">
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faBuilding} className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Datos de Facturación</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar bg-white">
                    <div className="relative flex w-full items-center rounded-lg bg-gray-100 p-1 border border-gray-200">
                        <span
                            className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-[calc(50%-4px)] rounded-md bg-white shadow-sm border border-gray-200 transition-transform duration-300 ${
                                accountType === 'particular' ? 'translate-x-full' : 'translate-x-0'
                            }`}
                            style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                        />
                        <button
                            type="button"
                            onClick={() => setAccountType('empresa')}
                            className={`relative z-10 flex-1 py-2 text-xs font-bold transition-colors duration-300 uppercase text-center ${
                                accountType === 'empresa' ? 'text-accent' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Empresa
                        </button>
                        <button
                            type="button"
                            onClick={() => setAccountType('particular')}
                            className={`relative z-10 flex-1 py-2 text-xs font-bold transition-colors duration-300 uppercase text-center ${
                                accountType === 'particular' ? 'text-accent' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Autónomo
                        </button>
                    </div>

                    <div className="space-y-4">
                        {accountType === 'empresa' ? (
                            <>
                                <InputField label="Razón Social" name="businessName" value={formData.businessName} onChange={handleChange} icon={faBuilding} required={true} />
                                <InputField label="CIF" name="cif" value={formData.cif} onChange={handleChange} icon={faFileInvoice} required={true} />
                            </>
                        ) : (
                            <>
                                <InputField label="Nombre y Apellidos" name="name" value={formData.name} onChange={handleChange} icon={faUser} required={true} />
                                <InputField label="DNI / NIE" name="dni" value={formData.dni} onChange={handleChange} icon={faIdCard} required={true} />
                            </>
                        )}
                        
                        <div className="border-t border-gray-100 my-6"></div>

                        <InputField label="Dirección (Calle, Nº, Piso)" name="streetAddress" value={formData.streetAddress} onChange={handleChange} required={true} />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField label="C. Postal" name="postalCode" value={formData.postalCode} onChange={handleChange} required={true} />
                            <InputField label="Ciudad" name="city" value={formData.city} onChange={handleChange} required={true} />
                            <InputField label="Provincia" name="province" value={formData.province} onChange={handleChange} required={true} />
                        </div>

                        <InputField label="Teléfono" name="phone" value={formData.phone} onChange={handleChange} icon={faPhone} required={true} />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold uppercase rounded-r">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end items-center gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm">Cancelar</button>
                    <button onClick={handleConfirmSave} className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm">Guardar Datos</button>
                </div>
            </div>
        </div>
    );
};

export default BusinessDataModal;