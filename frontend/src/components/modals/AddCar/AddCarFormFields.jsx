// autogest-app/frontend/src/components/modals/AddCar/AddCarFormFields.jsx
import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faBolt, faShieldAlt, faXmark
} from '@fortawesome/free-solid-svg-icons';
import Select from '../../Select';

export const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, error, required = false, placeholder = '' }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
            {label}
            {required && <span className="text-red-accent ml-1">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
                className={`w-full px-3 py-2 bg-background border rounded-md focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary ${
                    error ? 'border-red-accent' : 'border-border-color'
                } ${icon ? 'pl-9' : ''}`}
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-accent">{error}</p>}
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
            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary resize-none overflow-hidden"
                rows="3"
            />
        </div>
    );
};

const ToggleSwitch = ({ label, icon, enabled, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <div className="flex items-center gap-4 mt-2">
            <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
            <button
                type="button"
                onClick={onChange}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${enabled ? 'bg-accent' : 'bg-zinc-200 dark:bg-zinc-700'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`font-semibold ${enabled ? 'text-accent' : 'text-text-secondary'}`}>
                {enabled ? 'Sí' : 'No'}
            </span>
        </div>
    </div>
);

const AddCarFormFields = ({ newCar, fieldErrors, locations, fuelOptions, transmissionOptions, handleChange, handleLocationSelect, handleNewLocationInput, handleSelectChange, handleTagKeyDown, tagInput, setTagInput, removeTag }) => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Marca" name="make" value={newCar.make} onChange={handleChange} icon={faCar} error={fieldErrors.make} required={true} />
            <InputField label="Modelo" name="model" value={newCar.model} onChange={handleChange} icon={faStar} error={fieldErrors.model} required={true} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Matrícula" name="licensePlate" value={newCar.licensePlate} onChange={handleChange} icon={faIdCard} error={fieldErrors.licensePlate} required={true} />
            <InputField label="Nº de Bastidor" name="vin" value={newCar.vin} onChange={handleChange} icon={faFingerprint} error={fieldErrors.vin} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Fecha de Matriculación" name="registrationDate" type="date" value={newCar.registrationDate} onChange={handleChange} icon={faCalendarDay} />
            <InputField label="Precio de Compra (€)" name="purchasePrice" type="text" inputMode="decimal" value={newCar.purchasePrice} onChange={handleChange} icon={faEuroSign} error={fieldErrors.purchasePrice} required={true} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Precio de Venta (€)" name="price" type="text" inputMode="decimal" value={newCar.price} onChange={handleChange} icon={faEuroSign} error={fieldErrors.price} required={true} />
            <InputField label="Kilómetros" name="km" type="text" inputMode="numeric" value={newCar.km} onChange={handleChange} icon={faRoad} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Potencia (CV)" name="horsepower" type="text" inputMode="numeric" value={newCar.horsepower} onChange={handleChange} icon={faBolt} />
            <ToggleSwitch
                label="¿Tiene seguro en vigor?"
                icon={faShieldAlt}
                enabled={newCar.hasInsurance}
                onChange={() => handleChange({ target: { name: 'hasInsurance', value: !newCar.hasInsurance }})}
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
                label="O Nueva Ubicación"
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
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Etiquetas</label>
            <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2 bg-background border border-border-color rounded-lg focus-within:ring-1 focus-within:ring-blue-accent focus-within:border-blue-accent">
                {newCar.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-blue-accent/10 text-blue-accent text-sm px-2 py-1 rounded">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:opacity-75"><FontAwesomeIcon icon={faXmark} className="w-3 h-3" /></button>
                    </span>
                ))}
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Añadir etiqueta y pulsar Enter" className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-text-primary text-sm min-w-[150px]" />
            </div>
        </div>
        <TextareaField label="Anotaciones" name="notes" value={newCar.notes} onChange={handleChange} placeholder="Añade cualquier anotación relevante sobre el coche..." />
    </>
);

export default AddCarFormFields;