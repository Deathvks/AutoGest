// autogest-app/frontend/src/components/modals/EditCar/EditCarFormFields.jsx
import React, { useMemo, useContext } from 'react'; // <-- Importar useContext
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faBolt, faXmark, faKey
} from '@fortawesome/free-solid-svg-icons';
import Select from '../../Select';
import { AuthContext } from '../../../context/AuthContext'; // <-- Importar el contexto de autenticación

export const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, required = false, placeholder = '' }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1 uppercase">
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
                className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-1 focus:border-blue-accent text-text-primary transition-colors border-border-color focus:ring-blue-accent uppercase ${icon ? 'pl-9' : ''}`}
            />
        </div>
    </div>
);

const KeySelector = ({ label, icon, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1 uppercase">{label}</label>
        <div className="flex items-center gap-4 mt-2">
            <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
            <div className="flex items-center rounded-lg bg-background p-1 border border-border-color text-text-secondary">
                {[1, 2, 3].map(num => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => onChange(num)}
                        className={`px-4 py-1 text-sm rounded-md transition-colors uppercase ${value === num ? 'bg-accent text-white' : 'hover:bg-component-bg-hover'}`}
                    >
                        {num}
                    </button>
                ))}
            </div>
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
    // --- INICIO DE LA MODIFICACIÓN ---
    const { user } = useContext(AuthContext); // Obtenemos el usuario del contexto
    // --- FIN DE LA MODIFICACIÓN ---

    const locationOptions = useMemo(() => {
        const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));
        return [{ id: '', name: 'SELECCIONAR EXISTENTE...' }, ...sortedLocations];
    }, [locations]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="MARCA" name="make" value={editedCar.make} onChange={handleChange} icon={faCar} required />
                <InputField label="MODELO" name="model" value={editedCar.model} onChange={handleChange} icon={faStar} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="MATRÍCULA" name="licensePlate" value={editedCar.licensePlate} onChange={handleChange} icon={faIdCard} required />
                <InputField label="Nº DE BASTIDOR" name="vin" value={editedCar.vin} onChange={handleChange} icon={faFingerprint} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                {/* Solo mostramos este campo si el usuario es admin o técnico */}
                {(user.role === 'admin' || user.role === 'technician') && (
                    <InputField label="PRECIO DE COMPRA (€)" name="purchasePrice" type="text" inputMode="decimal" value={editedCar.purchasePrice} onChange={handleChange} icon={faEuroSign} required />
                )}
                {/* --- FIN DE LA MODIFICACIÓN --- */}
                <InputField label="PRECIO DE VENTA (€)" name="price" type="text" inputMode="decimal" value={editedCar.price} onChange={handleChange} icon={faEuroSign} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="FECHA DE MATRICULACIÓN" name="registrationDate" type="date" value={editedCar.registrationDate ? editedCar.registrationDate.split('T')[0] : ''} onChange={handleChange} icon={faCalendarDay} />
                <InputField label="KILÓMETROS" name="km" type="text" inputMode="decimal" value={editedCar.km} onChange={handleChange} icon={faRoad} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="POTENCIA (CV)" name="horsepower" type="text" inputMode="decimal" value={editedCar.horsepower} onChange={handleChange} icon={faBolt} />
                <KeySelector
                    label="Nº DE LLAVES"
                    icon={faKey}
                    value={editedCar.keys}
                    onChange={(value) => handleChange({ target: { name: 'keys', value } })}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="UBICACIÓN EXISTENTE" value={editedCar.location} onChange={handleLocationSelect} options={locationOptions} icon={faMapMarkerAlt} />
                <InputField label="O NUEVA UBICACIÓN" name="newLocation" value={editedCar.newLocation} onChange={handleNewLocationInput} icon={faMapMarkerAlt} placeholder="ESCRIBE PARA CREAR/ACTUALIZAR" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="COMBUSTIBLE" value={editedCar.fuel} onChange={(value) => handleSelectChange('fuel', value)} options={fuelOptions} />
                <Select label="TIPO DE CAMBIO" value={editedCar.transmission} onChange={(value) => handleSelectChange('transmission', value)} options={transmissionOptions} />
            </div>
            <Select label="ESTADO" value={editedCar.status} onChange={(value) => handleSelectChange('status', value)} options={statusOptions} />
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1 uppercase">ETIQUETAS</label>
                <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2 bg-background border border-border-color rounded-lg focus-within:ring-1 focus-within:ring-blue-accent focus-within:border-blue-accent">
                    {editedCar.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-blue-accent/10 text-blue-accent text-sm px-2 py-1 rounded uppercase">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:opacity-75"><FontAwesomeIcon icon={faXmark} className="w-3 h-3" /></button>
                        </span>
                    ))}
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="AÑADIR ETIQUETA Y PULSAR ENTER" className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-text-primary text-sm min-w-[150px] uppercase" />
                </div>
            </div>
        </>
    );
};

export default EditCarFormFields;