// autogest-app/frontend/src/components/modals/EditCar/EditCarFormFields.jsx
import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faBolt, faXmark
} from '@fortawesome/free-solid-svg-icons';
import Select from '../../Select';

export const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, required = false, placeholder = '' }) => (
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
                type={type} name={name} value={value || ''} onChange={onChange} inputMode={inputMode} placeholder={placeholder}
                className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-1 focus:border-blue-accent text-text-primary transition-colors border-border-color focus:ring-blue-accent ${icon ? 'pl-9' : ''}`}
            />
        </div>
    </div>
);

const EditCarFormFields = ({
    editedCar,
    locations,
    fuelOptions,
    transmissionOptions,
    statusOptions,
    handleChange,
    handleLocationSelect,
    handleNewLocationInput,
    handleSelectChange,
    tagInput,
    setTagInput,
    handleTagKeyDown,
    removeTag
}) => {
    const locationOptions = useMemo(() => {
        const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));
        return [{ id: '', name: 'Seleccionar existente...' }, ...sortedLocations];
    }, [locations]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Marca" name="make" value={editedCar.make} onChange={handleChange} icon={faCar} required />
                <InputField label="Modelo" name="model" value={editedCar.model} onChange={handleChange} icon={faStar} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Matrícula" name="licensePlate" value={editedCar.licensePlate} onChange={handleChange} icon={faIdCard} required />
                <InputField label="Nº de Bastidor" name="vin" value={editedCar.vin} onChange={handleChange} icon={faFingerprint} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Precio de Compra (€)" name="purchasePrice" type="text" inputMode="decimal" value={editedCar.purchasePrice} onChange={handleChange} icon={faEuroSign} required />
                <InputField label="Precio de Venta (€)" name="price" type="text" inputMode="decimal" value={editedCar.price} onChange={handleChange} icon={faEuroSign} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Fecha de Matriculación" name="registrationDate" type="date" value={editedCar.registrationDate ? editedCar.registrationDate.split('T')[0] : ''} onChange={handleChange} icon={faCalendarDay} />
                <InputField label="Kilómetros" name="km" type="text" inputMode="decimal" value={editedCar.km} onChange={handleChange} icon={faRoad} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Potencia (CV)" name="horsepower" type="text" inputMode="decimal" value={editedCar.horsepower} onChange={handleChange} icon={faBolt} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Ubicación Existente" value={editedCar.location} onChange={handleLocationSelect} options={locationOptions} icon={faMapMarkerAlt} />
                <InputField label="O Nueva Ubicación" name="newLocation" value={editedCar.newLocation} onChange={handleNewLocationInput} icon={faMapMarkerAlt} placeholder="Escribe para crear/actualizar" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Combustible" value={editedCar.fuel} onChange={(value) => handleSelectChange('fuel', value)} options={fuelOptions} />
                <Select label="Tipo de Cambio" value={editedCar.transmission} onChange={(value) => handleSelectChange('transmission', value)} options={transmissionOptions} />
            </div>
            <Select label="Estado" value={editedCar.status} onChange={(value) => handleSelectChange('status', value)} options={statusOptions} />
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Etiquetas</label>
                <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2 bg-background border border-border-color rounded-lg focus-within:ring-1 focus-within:ring-blue-accent focus-within:border-blue-accent">
                    {editedCar.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-blue-accent/10 text-blue-accent text-sm px-2 py-1 rounded">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:opacity-75"><FontAwesomeIcon icon={faXmark} className="w-3 h-3" /></button>
                        </span>
                    ))}
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Añadir etiqueta y pulsar Enter" className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-text-primary text-sm min-w-[150px]" />
                </div>
            </div>
        </>
    );
};

// --- INICIO DE LA MODIFICACIÓN ---
export default EditCarFormFields;
// --- FIN DE LA MODIFICACIÓN ---