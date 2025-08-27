import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faXmark, faUpload, faBolt // <-- He añadido faBolt aquí
} from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';

// --- Componentes de Formulario (Re-estilizados) ---
const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
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
                className={`w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary ${icon ? 'pl-9' : ''}`} 
            />
        </div>
    </div>
);
const AutocompleteField = ({ label, name, value, onChange, options, icon }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
                    </div>
                )}
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    list="location-options"
                    className={`w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary ${icon ? 'pl-9' : ''}`}
                />
                <datalist id="location-options">
                    {options && options.map((option) => (
                        <option key={option.id} value={option.name} />
                    ))}
                </datalist>
            </div>
        </div>
    );
};
const TextareaField = ({ label, name, value, onChange, placeholder }) => {
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
            <textarea ref={textareaRef} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary resize-none overflow-hidden" rows="3" />
        </div>
    );
};

const EditCarModal = ({ car, onClose, onUpdate, locations }) => {
    const sanitizeCarData = (carData) => {
        const sanitizedData = { ...carData };
        for (const key in sanitizedData) {
            if (sanitizedData[key] === null) {
                sanitizedData[key] = '';
            }
        }
        if (typeof sanitizedData.tags === 'string' && sanitizedData.tags) {
            try {
                sanitizedData.tags = JSON.parse(sanitizedData.tags);
            } catch (e) {
                sanitizedData.tags = [];
            }
        } else if (!Array.isArray(sanitizedData.tags)) {
            sanitizedData.tags = [];
        }
        return sanitizedData;
    };

    const [editedCar, setEditedCar] = useState(sanitizeCarData(car));
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);
    
    const fuelOptions = [
        { id: 'Gasolina', name: 'Gasolina' },
        { id: 'Diesel', name: 'Diesel' },
        { id: 'Híbrido', name: 'Híbrido' },
        { id: 'Eléctrico', name: 'Eléctrico' },
    ];
    
    const transmissionOptions = [
        { id: 'Manual', name: 'Manual' },
        { id: 'Automático', name: 'Automático' },
    ];
    
    const statusOptions = [
        { id: 'En venta', name: 'En venta' },
        { id: 'Vendido', name: 'Vendido' },
        { id: 'Reservado', name: 'Reservado' },
        { id: 'Taller', name: 'Taller' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedCar(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setEditedCar(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput) {
            e.preventDefault();
            if (!editedCar.tags.includes(tagInput.trim()) && tagInput.trim() !== '') {
                setEditedCar(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };
    const removeTag = (tagToRemove) => {
        setEditedCar(prev => ({...prev, tags: editedCar.tags.filter(tag => tag !== tagToRemove)}));
    };
    
    const parseNumber = (str) => {
        if (typeof str !== 'string' || !str) return String(str);
        return str.replace(/\./g, '').replace(',', '.');
    };

    const validateForm = () => {
        const price = parseFloat(parseNumber(String(editedCar.price)));
        if (!editedCar.make || !editedCar.model || !editedCar.licensePlate || !editedCar.price) {
            setError('Los campos Marca, Modelo, Matrícula y Precio de Venta son obligatorios.');
            return false;
        }
        if (isNaN(price) || price <= 0) {
            setError('El precio de venta debe ser un número válido y mayor que cero.');
            return false;
        }
        setError('');
        return true;
    };
    
    const handleUpdate = () => {
        if (!validateForm()) return;
        
        const formData = new FormData();
        const ignoredFields = ['id', 'createdAt', 'updatedAt', 'userId'];

        const finalCarData = { 
            ...editedCar, 
            price: parseNumber(String(editedCar.price)),
            purchasePrice: parseNumber(String(editedCar.purchasePrice)),
            salePrice: parseNumber(String(editedCar.salePrice)),
            reservationDeposit: parseNumber(String(editedCar.reservationDeposit)),
            km: parseNumber(String(editedCar.km)),
            horsepower: parseNumber(String(editedCar.horsepower)),
        };

        Object.keys(finalCarData).forEach(key => {
            if (!ignoredFields.includes(key)) {
                const value = finalCarData[key];
                if (key === 'tags') {
                    formData.append(key, JSON.stringify(value));
                } else if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            }
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        onUpdate(formData);
    };

    return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-2xl p-6 border border-border-color max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">Editar Coche</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-text-secondary mb-2">Imagen Principal</label>
                            <div className="w-40 h-28 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border-color">
                                <img 
                                    src={imagePreview || editedCar.imageUrl || `https://placehold.co/600x400/e2e8f0/1e293b?text=${editedCar.make}+${editedCar.model}`} 
                                    alt="Vista previa" 
                                    className="h-full w-full object-cover" 
                                />
                            </div>
                            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                            <button type="button" onClick={() => imageInputRef.current.click()} className="mt-2 bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium w-40 flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon={faUpload} />
                                Cambiar Imagen
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Marca" name="make" value={editedCar.make} onChange={handleChange} icon={faCar} />
                            <InputField label="Modelo" name="model" value={editedCar.model} onChange={handleChange} icon={faStar} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Matrícula" name="licensePlate" value={editedCar.licensePlate} onChange={handleChange} icon={faIdCard} />
                            <InputField label="Nº de Bastidor" name="vin" value={editedCar.vin} onChange={handleChange} icon={faFingerprint} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Fecha de Matriculación" name="registrationDate" type="date" value={editedCar.registrationDate ? editedCar.registrationDate.split('T')[0] : ''} onChange={handleChange} icon={faCalendarDay}/>
                            <InputField label="Precio de Venta (€)" name="price" type="text" inputMode="decimal" value={editedCar.price} onChange={handleChange} icon={faEuroSign} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <InputField label="Kilómetros" name="km" type="text" inputMode="decimal" value={editedCar.km} onChange={handleChange} icon={faRoad} />
                             <InputField label="Caballos (CV)" name="horsepower" type="text" inputMode="decimal" value={editedCar.horsepower} onChange={handleChange} icon={faBolt} />
                        </div>
                        <AutocompleteField label="Ubicación" name="location" value={editedCar.location} onChange={handleChange} options={locations} icon={faMapMarkerAlt}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Combustible"
                                value={editedCar.fuel}
                                onChange={(value) => handleSelectChange('fuel', value)}
                                options={fuelOptions}
                            />
                            <Select
                                label="Tipo de Cambio"
                                value={editedCar.transmission}
                                onChange={(value) => handleSelectChange('transmission', value)}
                                options={transmissionOptions}
                            />
                        </div>
                        <Select
                            label="Estado"
                            value={editedCar.status}
                            onChange={(value) => handleSelectChange('status', value)}
                            options={statusOptions}
                        />
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
                        <TextareaField label="Anotaciones" name="notes" value={editedCar.notes} onChange={handleChange} placeholder="Añade cualquier anotación relevante sobre el coche..." />
                    </div>
                </form>
                {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleUpdate} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default EditCarModal;