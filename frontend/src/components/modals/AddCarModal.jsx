// autogest-app/frontend/src/components/modals/AddCarModal.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faXmark, faUpload, faPaperclip, faBolt, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';
import InsuranceConfirmationModal from './InsuranceConfirmationModal';

const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, error, required = false, placeholder = '' }) => (
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


const AddCarModal = ({ onClose, onAdd, locations }) => {
    const [newCar, setNewCar] = useState({
        make: '', model: '', licensePlate: '', vin: '', registrationDate: new Date().toISOString().split('T')[0],
        purchasePrice: '', price: '', km: '', horsepower: '', location: '', 
        newLocation: '',
        notes: '', tags: [], hasInsurance: false
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [documentFiles, setDocumentFiles] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [showInsuranceConfirm, setShowInsuranceConfirm] = useState(false);
    const imageInputRef = useRef(null);
    const documentInputRef = useRef(null);

    const fuelOptions = [ { id: 'Gasolina', name: 'Gasolina' }, { id: 'Diesel', name: 'Diesel' }, { id: 'Híbrido', name: 'Híbrido' }, { id: 'Eléctrico', name: 'Eléctrico' } ];
    const transmissionOptions = [ { id: 'Manual', name: 'Manual' }, { id: 'Automático', name: 'Automático' } ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCar(prev => ({ ...prev, [name]: value }));
    };
    
    const handleLocationSelect = (value) => {
        setNewCar(prev => ({ ...prev, location: value, newLocation: '' }));
    };

    const handleNewLocationInput = (e) => {
        const { value } = e.target;
        setNewCar(prev => ({ ...prev, newLocation: value, location: '' }));
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
        if (documentFiles.length + newFiles.length > 2) {
            alert("Solo puedes subir un máximo de 2 archivos.");
            return;
        }
        setDocumentFiles(prevFiles => [...prevFiles, ...newFiles]);
    };

    const removeDocumentFile = (fileToRemove) => {
        setDocumentFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput) {
            e.preventDefault();
            if (!newCar.tags.includes(tagInput.trim()) && tagInput.trim() !== '') {
                setNewCar(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };
    
    const removeTag = (tagToRemove) => {
        setNewCar(prev => ({...prev, tags: prev.tags.filter(tag => tag !== tagToRemove)}));
    };

    const parseNumber = (str) => {
        if (typeof str !== 'string' || !str) return '';
        return str.replace(/\./g, '').replace(',', '.');
    };

    const validateForm = () => {
        const errors = {};
        if (!newCar.make.trim()) errors.make = 'La marca es obligatoria';
        if (!newCar.model.trim()) errors.model = 'El modelo es obligatorio';
        if (!newCar.licensePlate.trim()) errors.licensePlate = 'La matrícula es obligatoria';
        if (!newCar.purchasePrice.trim()) errors.purchasePrice = 'El precio de compra es obligatorio';
        if (!newCar.price.trim()) errors.price = 'El precio de venta es obligatorio';
        
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            setError('Por favor, corrige los errores marcados.');
            return false;
        }
        
        setError('');
        return true;
    };

    const proceedWithAdd = async () => {
        try {
            setError('');
            let notesPayload = '';
            if (newCar.notes && newCar.notes.trim() !== '') {
                const initialNote = { id: Date.now(), content: newCar.notes, type: 'General', date: new Date().toISOString().split('T')[0] };
                notesPayload = JSON.stringify([initialNote]);
            }
            
            const selectedLocationObject = locations.find(loc => loc.id === newCar.location);
            const finalLocation = newCar.newLocation.trim() || (selectedLocationObject ? selectedLocationObject.name : '');

            const finalCarData = { ...newCar, location: finalLocation, notes: notesPayload, price: parseNumber(newCar.price), purchasePrice: parseNumber(newCar.purchasePrice), km: parseNumber(newCar.km), horsepower: parseNumber(newCar.horsepower) };
            delete finalCarData.newLocation;
    
            const formData = new FormData();
            Object.keys(finalCarData).forEach(key => {
                const value = finalCarData[key];
                if (key === 'tags') {
                    formData.append(key, JSON.stringify(value));
                } else if (value !== null && value !== undefined && value !== '') {
                    formData.append(key, value);
                }
            });
            if (imageFile) formData.append('image', imageFile);
            documentFiles.forEach(file => {
                formData.append('documents', file);
            });
            
            await onAdd(formData);
        } catch (error) {
            console.error('Error al añadir coche:', error);
            setError(error.message || 'Error al añadir el coche. Por favor, inténtalo de nuevo.');
        }
    };

    const handleAdd = () => {
        if (!validateForm()) return;
        if (!newCar.hasInsurance) {
            setShowInsuranceConfirm(true);
        } else {
            proceedWithAdd();
        }
    };
    
    const locationOptions = useMemo(() => {
        const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));
        return [{ id: '', name: 'Seleccionar existente...' }, ...sortedLocations];
    }, [locations]);

    return (
       <>
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
                <div className="bg-component-bg rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                        <h2 className="text-xl font-bold text-text-primary">Añadir Nuevo Coche</h2>
                        <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                            <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <form onSubmit={(e) => e.preventDefault()} noValidate className="flex-grow overflow-y-auto p-6 space-y-4">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-secondary mb-2">Imagen Principal</label>
                            <div className="w-40 h-28 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border-color">
                                {imagePreview ? ( <img src={imagePreview} alt="Vista previa" className="h-full w-full object-cover" /> ) : ( <span className="text-xs text-text-secondary">Sin imagen</span> )}
                            </div>
                            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                            <button type="button" onClick={() => imageInputRef.current.click()} className="mt-2 bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium w-40 flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon={faUpload} />
                                Seleccionar
                            </button>
                        </div>

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
                                onChange={() => setNewCar(prev => ({ ...prev, hasInsurance: !prev.hasInsurance }))}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Ubicación Existente"
                                value={newCar.location}
                                onChange={handleLocationSelect}
                                options={locationOptions}
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
                            <label className="block text-sm font-medium text-text-secondary mb-1">Archivos varios (Ficha, Permiso circulación, etc.)</label>
                            <div className="flex items-center gap-2 mt-2">
                                <button type="button" onClick={() => documentInputRef.current.click()} className="w-full bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors flex items-center justify-center gap-2 border border-border-color disabled:opacity-50" disabled={documentFiles.length >= 2}>
                                    <FontAwesomeIcon icon={faPaperclip} />
                                    <span>{documentFiles.length >= 2 ? 'Límite alcanzado' : 'Añadir archivo'}</span>
                                </button>
                                <input type="file" accept="image/*,application/pdf" ref={documentInputRef} onChange={handleDocumentChange} className="hidden" multiple />
                            </div>
                            {documentFiles.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {documentFiles.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between text-xs text-text-secondary bg-background p-2 rounded-md">
                                            <span className="truncate">{file.name}</span>
                                            <button onClick={() => removeDocumentFile(file)} className="ml-2 text-red-accent hover:opacity-75">
                                                <FontAwesomeIcon icon={faXmark} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
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
                    </form>

                    {error && <p className="flex-shrink-0 px-6 pb-4 text-sm text-red-accent text-center">{error}</p>}

                    <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-border-color">
                        <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold">Cancelar</button>
                        <button onClick={handleAdd} className="bg-blue-accent text-white px-6 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity font-semibold">Añadir Coche</button>
                    </div>
                </div>
            </div>
            
            {showInsuranceConfirm && (
                <InsuranceConfirmationModal 
                    onConfirm={() => {
                        setShowInsuranceConfirm(false);
                        proceedWithAdd();
                    }}
                    onCancel={() => setShowInsuranceConfirm(false)}
                />
            )}
       </>
    );
};

export default AddCarModal;