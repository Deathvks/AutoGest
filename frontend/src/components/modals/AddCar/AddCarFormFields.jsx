// autogest-app/frontend/src/components/modals/AddCar/AddCarFormFields.jsx
import React, { useRef, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faBolt, faShieldAlt, faXmark, faKey
} from '@fortawesome/free-solid-svg-icons';
import Select from '../../Select';
import { AuthContext } from '../../../context/AuthContext';
// --- INICIO DE LA MODIFICACIÓN ---
import DatePicker from '../../DatePicker'; // Importamos el nuevo componente
// --- FIN DE LA MODIFICACIÓN ---

export const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, error, required = false, placeholder = '' }) => (
    <div>
        <label className="block text-sm font-semibold text-text-primary mb-1">
            {label}
            {required && <span className="text-red-accent ml-1">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                inputMode={inputMode}
                placeholder={placeholder}
                className={`w-full px-4 py-2 bg-component-bg-hover border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-secondary/70 ${
                    error ? 'border-red-accent' : 'border-border-color'
                } ${icon ? 'pl-11' : ''}`}
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-accent font-semibold">{error}</p>}
    </div>
);

export const TextareaField = ({ label, name, value, onChange, placeholder }) => {
    const textareaRef = useRef(null);
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);
    return (
        <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">{label}</label>
            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-secondary/70 resize-none overflow-hidden"
                rows="3"
            />
        </div>
    );
};

const ToggleSwitch = ({ label, icon, enabled, onChange }) => (
    <div className="bg-background/50 p-4 rounded-xl border border-border-color flex items-center justify-between">
        <label className="flex items-center text-sm font-semibold text-text-primary">
            <FontAwesomeIcon icon={icon} className="h-4 w-4 text-accent mr-3" />
            {label}
        </label>
        <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={onChange}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${enabled ? 'bg-accent' : 'bg-component-bg-hover'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`font-semibold text-xs w-6 ${enabled ? 'text-accent' : 'text-text-secondary'}`}>
                {enabled ? 'SÍ' : 'NO'}
            </span>
        </div>
    </div>
);

const KeySelector = ({ label, icon, value, onChange }) => (
    <div className="bg-background/50 p-4 rounded-xl border border-border-color flex items-center justify-between">
        <label className="flex items-center text-sm font-semibold text-text-primary">
            <FontAwesomeIcon icon={icon} className="h-4 w-4 text-accent mr-3" />
            {label}
        </label>
        <div className="flex items-center rounded-lg bg-component-bg-hover p-1 border border-border-color text-text-secondary">
            {[1, 2, 3].map(num => (
                <button
                    key={num}
                    type="button"
                    onClick={() => onChange(num)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${value === num ? 'bg-component-bg text-text-primary shadow-md' : 'hover:bg-border-color'}`}
                >
                    {num}
                </button>
            ))}
        </div>
    </div>
);

const AddCarFormFields = ({ newCar, fieldErrors, locations, fuelOptions, transmissionOptions, handleChange, handleLocationSelect, handleNewLocationInput, handleSelectChange, handleTagKeyDown, tagInput, setTagInput, removeTag }) => {
    const { user } = useContext(AuthContext); 
    // --- INICIO DE LA MODIFICACIÓN ---
    const canViewSensitiveData = user.role === 'admin' || user.isOwner || !user.companyId;
    // --- FIN DE LA MODIFICACIÓN ---

    // --- INICIO DE LA MODIFICACIÓN ---
    // Handler específico para el DatePicker
    const handleDateChange = (date) => {
        handleChange({ target: { name: 'registrationDate', value: date } });
    };
    // --- FIN DE LA MODIFICACIÓN ---

    return(
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Marca" name="make" value={newCar.make} onChange={handleChange} icon={faCar} error={fieldErrors.make} required={true} />
                <InputField label="Modelo" name="model" value={newCar.model} onChange={handleChange} icon={faStar} error={fieldErrors.model} required={true} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Matrícula" name="licensePlate" value={newCar.licensePlate} onChange={handleChange} icon={faIdCard} error={fieldErrors.licensePlate} required={true} />
                <InputField label="Nº de Bastidor" name="vin" value={newCar.vin} onChange={handleChange} icon={faFingerprint} error={fieldErrors.vin} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                <DatePicker 
                    label="Fecha de Matriculación"
                    value={newCar.registrationDate}
                    onChange={handleDateChange}
                    placeholder="DD/MM/AAAA" // Placeholder para cuando esté vacío
                />
                {/* --- FIN DE LA MODIFICACIÓN --- */}
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                {canViewSensitiveData && (
                    <InputField label="Precio de Compra (€)" name="purchasePrice" type="text" inputMode="decimal" value={newCar.purchasePrice} onChange={handleChange} icon={faEuroSign} error={fieldErrors.purchasePrice} required={true} />
                )}
                {/* --- FIN DE LA MODIFICACIÓN --- */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Precio de Venta (€)" name="price" type="text" inputMode="decimal" value={newCar.price} onChange={handleChange} icon={faEuroSign} error={fieldErrors.price} required={true} />
                <InputField label="Kilómetros" name="km" type="text" inputMode="numeric" value={newCar.km} onChange={handleChange} icon={faRoad} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Potencia (CV)" name="horsepower" type="text" inputMode="numeric" value={newCar.horsepower} onChange={handleChange} icon={faBolt} />
                <KeySelector
                    label="Nº de Llaves"
                    icon={faKey}
                    value={newCar.keys}
                    onChange={(value) => handleChange({ target: { name: 'keys', value } })}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Select
                    label="Ubicación Existente"
                    value={newCar.location}
                    onChange={handleLocationSelect}
                    options={locations}
                    icon={faMapMarkerAlt}
                />
                <InputField
                    label="o Nueva Ubicación"
                    name="newLocation"
                    value={newCar.newLocation}
                    onChange={handleNewLocationInput}
                    icon={faMapMarkerAlt}
                    placeholder="Escribe para crear una nueva"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Combustible" value={newCar.fuel} onChange={(value) => handleSelectChange('fuel', value)} options={fuelOptions} />
                <Select label="Tipo de Cambio" value={newCar.transmission} onChange={(value) => handleSelectChange('transmission', value)} options={transmissionOptions} />
            </div>
            
            <ToggleSwitch
                label="¿Tiene seguro en vigor?"
                icon={faShieldAlt}
                enabled={newCar.hasInsurance}
                onChange={() => handleChange({ target: { name: 'hasInsurance', type: 'checkbox', checked: !newCar.hasInsurance } })}
            />

            <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Etiquetas</label>
                <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2 bg-component-bg-hover border border-border-color rounded-lg focus-within:ring-1 focus-within:ring-accent focus-within:border-accent">
                    {newCar.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1.5 bg-accent/10 text-accent text-sm font-semibold px-2 py-1 rounded">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:opacity-75"><FontAwesomeIcon icon={faXmark} className="w-3 h-3" /></button>
                        </span>
                    ))}
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Añadir y pulsar Enter" className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-text-primary text-sm min-w-[150px]" />
                </div>
            </div>
            <TextareaField label="Anotaciones" name="notes" value={newCar.notes} onChange={handleChange} placeholder="Añade cualquier anotación relevante sobre el coche..." />
        </div>
    );
}

export default AddCarFormFields;