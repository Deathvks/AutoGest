// autogest-app/frontend/src/components/modals/AddCarModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faXmark, faUpload, faPaperclip, faBolt
} from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';
import api from '../../services/api';

const SparklesIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.94 14.32c.32-.32.44-.78.34-1.22-.1-.44-.4-.74-.84-.84-.44-.1-.9.02-1.22.34l-3.5 3.5c-.98.98-.98 2.56 0 3.54.98.98 2.56.98 3.54 0l1.68-1.68"/><path d="m21.66 3.34-3.5 3.5c-.98.98-.98 2.56 0 3.54.98.98 2.56.98 3.54 0l1.68-1.68"/><path d="M14.32 9.94c.32.32.78.44 1.22.34.44-.1.74-.4.84-.84.1-.44-.02-.9-.34-1.22l-3.5-3.5c-.98-.98-2.56-.98-3.54 0-.98.98-.98 2.56 0 3.54l1.68 1.68"/><path d="M3.34 21.66l3.5-3.5c.98-.98-.98-2.56 0-3.54-.98-.98-2.56-.98-3.54 0l-1.68 1.68"/></svg> );

const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, error, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
            {label}
            {required && <span className="text-red-accent ml-1">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-slate-500 dark:text-white" />
                </div>
            )}
            <input 
                type={type} 
                name={name} 
                value={value} 
                onChange={onChange} 
                inputMode={inputMode}
                className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary ${
                    error ? 'border-red-accent' : 'border-border-color'
                } ${icon ? 'pl-9' : ''}`} 
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-accent">{error}</p>}
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
            <textarea 
                ref={textareaRef} 
                name={name} 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary resize-none overflow-hidden" 
                rows="3" 
            />
        </div>
    );
};

const AddCarModal = ({ isOpen, onClose, onAdd }) => {
    const [newCar, setNewCar] = useState({
        make: '', model: '', licensePlate: '', vin: '', registrationDate: '',
        purchasePrice: '', km: '', horsepower: '', location: '', notes: '', tags: []
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [registrationDocumentFile, setRegistrationDocumentFile] = useState(null);
    const [tagInput, setTagInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [locations, setLocations] = useState([]);
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const documentInputRef = useRef(null);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCar(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setNewCar(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDocumentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRegistrationDocumentFile(file);
        }
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
        let hasErrors = false;

        // Validar campos obligatorios
        if (!newCar.make.trim()) {
            errors.make = 'La marca es obligatoria';
            hasErrors = true;
        }
        
        if (!newCar.model.trim()) {
            errors.model = 'El modelo es obligatorio';
            hasErrors = true;
        }
        
        if (!newCar.licensePlate.trim()) {
            errors.licensePlate = 'La matrícula es obligatoria';
            hasErrors = true;
        }
        
        if (!newCar.purchasePrice.trim()) {
            errors.purchasePrice = 'El precio de compra es obligatorio';
            hasErrors = true;
        } else {
            const price = parseFloat(parseNumber(newCar.purchasePrice));
            if (isNaN(price) || price <= 0) {
                errors.purchasePrice = 'El precio debe ser un número válido mayor que cero';
                hasErrors = true;
            }
        }

        // Validar formato de matrícula española (opcional pero recomendado)
        if (newCar.licensePlate.trim()) {
            const plateRegex = /^[0-9]{4}[A-Z]{3}$|^[A-Z]{1,2}[0-9]{4}[A-Z]{2}$/;
            if (!plateRegex.test(newCar.licensePlate.replace(/[\s-]/g, '').toUpperCase())) {
                errors.licensePlate = 'Formato de matrícula no válido (ej: 1234ABC o M1234BC)';
                hasErrors = true;
            }
        }

        // Validar VIN si se proporciona
        if (newCar.vin.trim() && newCar.vin.length !== 17) {
            errors.vin = 'El VIN debe tener exactamente 17 caracteres';
            hasErrors = true;
        }

        // Validar kilómetros si se proporcionan
        if (newCar.km.trim()) {
            const km = parseFloat(parseNumber(newCar.km));
            if (isNaN(km) || km < 0) {
                errors.km = 'Los kilómetros deben ser un número válido';
                hasErrors = true;
            }
        }

        // Validar potencia si se proporciona
        if (newCar.horsepower.trim()) {
            const hp = parseFloat(parseNumber(newCar.horsepower));
            if (isNaN(hp) || hp <= 0) {
                errors.horsepower = 'La potencia debe ser un número válido mayor que cero';
                hasErrors = true;
            }
        }

        // Validar fecha de matriculación si se proporciona
        if (newCar.registrationDate) {
            const regDate = new Date(newCar.registrationDate);
            const today = new Date();
            if (regDate > today) {
                errors.registrationDate = 'La fecha de matriculación no puede ser futura';
                hasErrors = true;
            }
        }

        setFieldErrors(errors);
        
        if (hasErrors) {
            setError('Por favor, corrige los errores marcados en rojo.');
            return false;
        }
        
        setError('');
        setFieldErrors({});
        return true;
    };

    const handleAdd = async () => {
        if (!validateForm()) return;
        
        try {
            setError('');
            const finalCarData = { 
                ...newCar, 
                price: parseNumber(newCar.purchasePrice),
                purchasePrice: parseNumber(newCar.purchasePrice),
                km: parseNumber(newCar.km),
                horsepower: parseNumber(newCar.horsepower),
            };
    
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
            if (registrationDocumentFile) formData.append('registrationDocument', registrationDocumentFile);
            
            await onAdd(formData);
        } catch (error) {
            console.error('Error al añadir coche:', error);
            if (error.response?.data?.error) {
                const errorMessage = error.response.data.error;
                if (errorMessage.toLowerCase().includes('matrícula') || errorMessage.toLowerCase().includes('matricula')) {
                    setFieldErrors({ licensePlate: 'Esta matrícula ya está registrada' });
                    setError('No se pueden repetir valores de matrícula. ' + errorMessage);
                } else if (errorMessage.toLowerCase().includes('bastidor') || errorMessage.toLowerCase().includes('vin')) {
                    setFieldErrors({ vin: 'Este VIN ya está registrado' });
                    setError('No se pueden repetir valores de VIN. ' + errorMessage);
                } else {
                    setError(errorMessage);
                }
            } else if (error.response?.data?.message) {
                if (error.response.data.message.includes('licensePlate')) {
                    setFieldErrors({ licensePlate: 'Esta matrícula ya está registrada' });
                    setError('No se pueden repetir valores de matrícula. Ya existe un coche con esta matrícula.');
                } else if (error.response.data.message.includes('vin')) {
                    setFieldErrors({ vin: 'Este VIN ya está registrado' });
                    setError('No se pueden repetir valores de VIN. Ya existe un coche con este número de bastidor.');
                } else {
                    setError(error.response.data.message);
                }
            } else {
                setError('Error al añadir el coche. Por favor, inténtalo de nuevo.');
            }
        }
    };
    
    const handleImageAnalysis = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsAnalyzing(true);
        setError('');

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const base64ImageData = reader.result;
                const extractedData = await api.analyzeDocument(base64ImageData);

                setNewCar(prev => ({
                    ...prev,
                    make: extractedData.make || prev.make,
                    model: extractedData.model || prev.model,
                    licensePlate: extractedData.licensePlate || prev.licensePlate,
                    vin: extractedData.vin || prev.vin,
                    registrationDate: extractedData.registrationDate || prev.registrationDate,
                    horsepower: extractedData.horsepower || prev.horsepower,
                }));

            } catch (error) {
                console.error("Error al analizar la imagen:", error);
                setError(error.message || "No se pudieron extraer los datos de la imagen.");
            } finally {
                setIsAnalyzing(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.onerror = (error) => {
            console.error("Error al leer el archivo:", error);
            setError("No se pudo leer el archivo de imagen.");
            setIsAnalyzing(false);
        };
    };

    return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-2xl p-6 border border-border-color max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">Añadir Nuevo Coche</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                            <div className="flex flex-col">
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
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Analizar Ficha Técnica</label>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageAnalysis} className="hidden" />
                                <button onClick={() => fileInputRef.current.click()} disabled={isAnalyzing} className="w-full bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors flex items-center justify-center gap-2 border border-border-color disabled:opacity-50">
                                    {isAnalyzing ? 'Analizando...' : <> <SparklesIcon className="w-5 h-5 text-blue-accent" /> Rellenar con IA </>}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField 
                                label="Marca" 
                                name="make" 
                                value={newCar.make} 
                                onChange={handleChange} 
                                icon={faCar} 
                                error={fieldErrors.make}
                                required={true}
                            />
                            <InputField 
                                label="Modelo" 
                                name="model" 
                                value={newCar.model} 
                                onChange={handleChange} 
                                icon={faStar} 
                                error={fieldErrors.model}
                                required={true}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField 
                                label="Matrícula" 
                                name="licensePlate" 
                                value={newCar.licensePlate} 
                                onChange={handleChange} 
                                icon={faIdCard} 
                                error={fieldErrors.licensePlate}
                                required={true}
                            />
                            <InputField 
                                label="Nº de Bastidor" 
                                name="vin" 
                                value={newCar.vin} 
                                onChange={handleChange} 
                                icon={faFingerprint} 
                                error={fieldErrors.vin}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField 
                                label="Fecha de Matriculación" 
                                name="registrationDate" 
                                type="date" 
                                value={newCar.registrationDate} 
                                onChange={handleChange} 
                                icon={faCalendarDay} 
                                error={fieldErrors.registrationDate}
                            />
                            <InputField 
                                label="Precio de Compra (€)" 
                                name="purchasePrice" 
                                type="text" 
                                inputMode="decimal" 
                                value={newCar.purchasePrice} 
                                onChange={handleChange} 
                                icon={faEuroSign} 
                                error={fieldErrors.purchasePrice}
                                required={true}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField 
                                label="Kilómetros" 
                                name="km" 
                                type="text" 
                                inputMode="numeric" 
                                value={newCar.km} 
                                onChange={handleChange} 
                                icon={faRoad} 
                                error={fieldErrors.km}
                            />
                            <InputField 
                                label="Potencia (CV)" 
                                name="horsepower" 
                                type="text" 
                                inputMode="numeric" 
                                value={newCar.horsepower} 
                                onChange={handleChange} 
                                icon={faBolt} 
                                error={fieldErrors.horsepower}
                            />
                        </div>
                        
                        <AutocompleteField label="Ubicación" name="location" value={newCar.location} onChange={handleChange} options={locations} icon={faMapMarkerAlt}/>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Combustible"
                                value={newCar.fuel}
                                onChange={(value) => handleSelectChange('fuel', value)}
                                options={fuelOptions}
                            />
                            <Select
                                label="Tipo de Cambio"
                                value={newCar.transmission}
                                onChange={(value) => handleSelectChange('transmission', value)}
                                options={transmissionOptions}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Permiso de Circulación</label>
                            <div className="flex items-center gap-2 mt-2">
                                <button type="button" onClick={() => documentInputRef.current.click()} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium flex-grow flex items-center justify-center gap-2">
                                    <FontAwesomeIcon icon={faPaperclip} />
                                    <span>{registrationDocumentFile ? 'Cambiar archivo' : 'Subir archivo (PDF o Imagen)'}</span>
                                </button>
                                <input type="file" accept="image/*,application/pdf" ref={documentInputRef} onChange={handleDocumentChange} className="hidden" />
                            </div>
                            {registrationDocumentFile && (
                                <p className="text-xs text-text-secondary mt-2">Archivo seleccionado: {registrationDocumentFile.name}</p>
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
                    </div>
                </form>
                {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleAdd} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Añadir Coche</button>
                </div>
            </div>
        </div>
    );
};

export default AddCarModal;