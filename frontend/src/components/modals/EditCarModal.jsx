// autogest-app/frontend/src/components/modals/EditCarModal.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faXmark, faUpload, faBolt, faExclamationTriangle, faPaperclip
} from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, error, required = false, placeholder = '' }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
            {label}
            {required && <span className="text-red-accent ml-1">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon
                        icon={icon}
                        className={`h-4 w-4 ${error ? 'text-red-accent' : 'text-slate-500 dark:text-white'}`}
                    />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                inputMode={inputMode}
                placeholder={placeholder}
                className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-1 focus:border-blue-accent text-text-primary transition-colors ${
                    icon ? 'pl-9' : ''
                } ${
                    error
                        ? 'border-red-accent focus:ring-red-accent/20 focus:border-red-accent'
                        : 'border-border-color focus:ring-blue-accent'
                }`}
            />
            {error && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-accent" />
                </div>
            )}
        </div>
        {error && (
            <p className="mt-1 text-xs text-red-accent flex items-center gap-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3" />
                {error}
            </p>
        )}
    </div>
);

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
        // Asegurarse de que documentUrls sea un array
        if (!Array.isArray(sanitizedData.documentUrls)) {
            sanitizedData.documentUrls = [];
        }
        return sanitizedData;
    };

    const [editedCar, setEditedCar] = useState(() => {
        const sanitized = sanitizeCarData(car);
        const currentLocation = locations.find(loc => loc.name === sanitized.location);
        return {
            ...sanitized,
            location: currentLocation ? currentLocation.id : '',
            newLocation: ''
        };
    });

    const [tagInput, setTagInput] = useState('');
    const [serverError, setServerError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [documentFiles, setDocumentFiles] = useState([]);
    const [filesToRemove, setFilesToRemove] = useState([]);
    const imageInputRef = useRef(null);
    const documentInputRef = useRef(null);
    
    const fuelOptions = [ { id: 'Gasolina', name: 'Gasolina' }, { id: 'Diesel', name: 'Diesel' }, { id: 'Híbrido', name: 'Híbrido' }, { id: 'Eléctrico', name: 'Eléctrico' }, ];
    const transmissionOptions = [ { id: 'Manual', name: 'Manual' }, { id: 'Automático', name: 'Automático' }, ];
    const statusOptions = [ { id: 'En venta', name: 'En venta' }, { id: 'Vendido', name: 'Vendido' }, { id: 'Reservado', name: 'Reservado' }, { id: 'Taller', name: 'Taller' }, ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedCar(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationSelect = (value) => {
        setEditedCar(prev => ({ ...prev, location: value, newLocation: '' }));
    };

    const handleNewLocationInput = (e) => {
        const { value } = e.target;
        setEditedCar(prev => ({ ...prev, newLocation: value, location: '' }));
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
    
    const handleDocumentChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const totalFiles = (editedCar.documentUrls?.length || 0) - filesToRemove.length + documentFiles.length + newFiles.length;
        if (totalFiles > 2) {
            alert("Solo puedes tener un máximo de 2 archivos en total.");
            e.target.value = '';
            return;
        }
        setDocumentFiles(prev => [...prev, ...newFiles]);
        e.target.value = '';
    };

    const removeExistingFile = (fileUrl) => {
        setFilesToRemove(prev => [...prev, fileUrl]);
        setEditedCar(prev => ({
            ...prev,
            documentUrls: prev.documentUrls.filter(url => url !== fileUrl)
        }));
    };
    
    const removeNewFile = (fileToRemove) => {
        setDocumentFiles(prev => prev.filter(file => file !== fileToRemove));
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
    
    const handleUpdate = async () => {
        try {
            setServerError('');
            const formData = new FormData();
            const ignoredFields = ['id', 'createdAt', 'updatedAt', 'userId', 'notes', 'newLocation', 'documentUrls'];

            const selectedLocation = locations.find(loc => loc.id === editedCar.location);
            const finalLocation = editedCar.newLocation.trim() || (selectedLocation ? selectedLocation.name : '');

            const finalCarData = { 
                ...editedCar,
                location: finalLocation,
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

            if (imageFile) formData.append('image', imageFile);
            documentFiles.forEach(file => formData.append('documents', file));
            formData.append('filesToRemove', JSON.stringify(filesToRemove));
            
            await onUpdate(formData);
        } catch (error) {
            setServerError(error.message || 'Error al actualizar el coche.');
        }
    };
    
    const locationOptions = useMemo(() => {
        const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));
        return [{ id: '', name: 'Seleccionar existente...' }, ...sortedLocations];
    }, [locations]);

    const totalFileCount = (editedCar.documentUrls?.length || 0) + documentFiles.length;

    return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-2xl p-6 border border-border-color max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">Editar Coche</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                
                {serverError && ( <div className="mb-4 p-3 bg-red-accent/10 border border-red-accent/20 rounded-lg"><p className="text-sm text-red-accent flex items-center gap-2"><FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />{serverError}</p></div> )}
                
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="space-y-4">
                        {/* ... (otros campos del formulario sin cambios) ... */}
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
                             <InputField label="Caballos (CV)" name="horsepower" type="text" inputMode="decimal" value={editedCar.horsepower} onChange={handleChange} icon={faBolt} />
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

                        {/* --- SECCIÓN DE ARCHIVOS MODIFICADA --- */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Archivos varios (Máx. 2)</label>
                            {editedCar.documentUrls && editedCar.documentUrls.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {editedCar.documentUrls.map((url, index) => (
                                        <li key={index} className="flex items-center justify-between text-xs text-text-secondary bg-background p-2 rounded-md">
                                            <a href={`${API_BASE_URL}${url}`} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">{url.split('/').pop()}</a>
                                            <button type="button" onClick={() => removeExistingFile(url)} className="ml-2 text-red-accent hover:opacity-75">
                                                <FontAwesomeIcon icon={faXmark} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {documentFiles.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {documentFiles.map((file, index) => (
                                         <li key={index} className="flex items-center justify-between text-xs text-text-secondary bg-background p-2 rounded-md">
                                            <span className="truncate">{file.name}</span>
                                            <button type="button" onClick={() => removeNewFile(file)} className="ml-2 text-red-accent hover:opacity-75">
                                                <FontAwesomeIcon icon={faXmark} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                             <div className="flex items-center gap-2 mt-2">
                                <button type="button" onClick={() => documentInputRef.current.click()} className="w-full bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors flex items-center justify-center gap-2 border border-border-color disabled:opacity-50" disabled={totalFileCount >= 2}>
                                    <FontAwesomeIcon icon={faPaperclip} />
                                    <span>{totalFileCount >= 2 ? 'Límite alcanzado' : 'Añadir archivo'}</span>
                                </button>
                                <input type="file" accept="image/*,application/pdf" ref={documentInputRef} onChange={handleDocumentChange} className="hidden" multiple />
                            </div>
                        </div>

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
                    </div>
                </form>
                
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleUpdate} className="px-4 py-2 rounded-lg shadow-sm transition-opacity bg-blue-accent text-white hover:opacity-90">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCarModal;