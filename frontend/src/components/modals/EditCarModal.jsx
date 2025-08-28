import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faXmark, faUpload, faBolt, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';

// --- Componentes de Formulario Mejorados ---
const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, error, required = false }) => (
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
                        className={`h-4 w-4 ${
                            error ? 'text-red-accent' : 'text-slate-500 dark:text-white'
                        }`} 
                    />
                </div>
            )}
            <input 
                type={type} 
                name={name} 
                value={value} 
                onChange={onChange}
                inputMode={inputMode}
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

const AutocompleteField = ({ label, name, value, onChange, options, icon, error }) => {
    const uniqueId = `location-options-${name}-edit`;
    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <FontAwesomeIcon 
                            icon={icon} 
                            className={`h-4 w-4 ${
                                error ? 'text-red-accent' : 'text-text-secondary'
                            }`} 
                        />
                    </div>
                )}
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    list={uniqueId}
                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-1 focus:border-blue-accent text-text-primary transition-colors ${
                        icon ? 'pl-9' : ''
                    } ${
                        error 
                            ? 'border-red-accent focus:ring-red-accent/20 focus:border-red-accent' 
                            : 'border-border-color focus:ring-blue-accent'
                    }`}
                />
                <datalist id={uniqueId}>
                    {options && options.map((option) => (
                        <option key={option.id} value={option.name} />
                    ))}
                </datalist>
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
};

const TextareaField = ({ label, name, value, onChange, placeholder, error }) => {
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
                className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-1 focus:border-blue-accent text-text-primary resize-none overflow-hidden transition-colors ${
                    error 
                        ? 'border-red-accent focus:ring-red-accent/20 focus:border-red-accent' 
                        : 'border-border-color focus:ring-blue-accent'
                }`} 
                rows="3" 
            />
            {error && (
                <p className="mt-1 text-xs text-red-accent flex items-center gap-1">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3" />
                    {error}
                </p>
            )}
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
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
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

    // Validaciones individuales
    const validateField = (name, value) => {
        const newErrors = { ...errors };
        
        switch (name) {
            case 'make':
                if (!value || value.trim() === '') {
                    newErrors.make = 'La marca es obligatoria';
                } else if (value.length < 2) {
                    newErrors.make = 'La marca debe tener al menos 2 caracteres';
                } else {
                    delete newErrors.make;
                }
                break;
                
            case 'model':
                if (!value || value.trim() === '') {
                    newErrors.model = 'El modelo es obligatorio';
                } else if (value.length < 1) {
                    newErrors.model = 'El modelo debe tener al menos 1 caracter';
                } else {
                    delete newErrors.model;
                }
                break;
                
            case 'licensePlate':
                if (!value || value.trim() === '') {
                    newErrors.licensePlate = 'La matrícula es obligatoria';
                } else {
                    // Validación básica de formato de matrícula española
                    const plateRegex = /^[0-9]{4}[A-Z]{3}$|^[A-Z]{1,2}[0-9]{4}[A-Z]{2}$|^[0-9]{1,4}[A-Z]{1,3}$/i;
                    if (!plateRegex.test(value.replace(/[\s-]/g, ''))) {
                        newErrors.licensePlate = 'Formato de matrícula no válido';
                    } else {
                        delete newErrors.licensePlate;
                    }
                }
                break;
                
            case 'vin':
                if (value && value.length > 0) {
                    if (value.length !== 17) {
                        newErrors.vin = 'El VIN debe tener exactamente 17 caracteres';
                    } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(value)) {
                        newErrors.vin = 'El VIN contiene caracteres no válidos';
                    } else {
                        delete newErrors.vin;
                    }
                } else {
                    delete newErrors.vin;
                }
                break;
                
            case 'registrationDate':
                if (value) {
                    const date = new Date(value);
                    const today = new Date();
                    const minDate = new Date('1900-01-01');
                    
                    if (date > today) {
                        newErrors.registrationDate = 'La fecha no puede ser futura';
                    } else if (date < minDate) {
                        newErrors.registrationDate = 'La fecha no puede ser anterior a 1900';
                    } else {
                        delete newErrors.registrationDate;
                    }
                } else {
                    delete newErrors.registrationDate;
                }
                break;
                
            case 'price':
                if (!value || value.trim() === '') {
                    newErrors.price = 'El precio de venta es obligatorio';
                } else {
                    const numericValue = parseFloat(parseNumber(String(value)));
                    if (isNaN(numericValue)) {
                        newErrors.price = 'El precio debe ser un número válido';
                    } else if (numericValue <= 0) {
                        newErrors.price = 'El precio debe ser mayor que cero';
                    } else if (numericValue > 10000000) {
                        newErrors.price = 'El precio parece demasiado alto';
                    } else {
                        delete newErrors.price;
                    }
                }
                break;
                
            case 'km':
                if (value && value.trim() !== '') {
                    const numericValue = parseFloat(parseNumber(String(value)));
                    if (isNaN(numericValue)) {
                        newErrors.km = 'Los kilómetros deben ser un número válido';
                    } else if (numericValue < 0) {
                        newErrors.km = 'Los kilómetros no pueden ser negativos';
                    } else if (numericValue > 2000000) {
                        newErrors.km = 'Los kilómetros parecen demasiado altos';
                    } else {
                        delete newErrors.km;
                    }
                } else {
                    delete newErrors.km;
                }
                break;
                
            case 'horsepower':
                if (value && value.trim() !== '') {
                    const numericValue = parseFloat(parseNumber(String(value)));
                    if (isNaN(numericValue)) {
                        newErrors.horsepower = 'Los caballos deben ser un número válido';
                    } else if (numericValue <= 0) {
                        newErrors.horsepower = 'Los caballos deben ser mayor que cero';
                    } else if (numericValue > 2000) {
                        newErrors.horsepower = 'Los caballos parecen demasiado altos';
                    } else {
                        delete newErrors.horsepower;
                    }
                } else {
                    delete newErrors.horsepower;
                }
                break;
                
            default:
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedCar(prev => ({ ...prev, [name]: value }));
        
        // Validar el campo en tiempo real
        validateField(name, value);
        
        // Limpiar error del servidor si existe
        if (serverError) {
            setServerError('');
        }
    };

    const handleSelectChange = (name, value) => {
        setEditedCar(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño del archivo (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'La imagen no puede superar los 5MB' }));
                return;
            }
            
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, image: 'Solo se permiten archivos de imagen' }));
                return;
            }
            
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            
            // Limpiar error de imagen si existe
            const newErrors = { ...errors };
            delete newErrors.image;
            setErrors(newErrors);
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
        const fieldsToValidate = ['make', 'model', 'licensePlate', 'price'];
        let isValid = true;
        
        fieldsToValidate.forEach(field => {
            if (!validateField(field, editedCar[field])) {
                isValid = false;
            }
        });
        
        // Validar campos opcionales si tienen valor
        ['vin', 'registrationDate', 'km', 'horsepower'].forEach(field => {
            if (editedCar[field]) {
                validateField(field, editedCar[field]);
            }
        });
        
        return isValid && Object.keys(errors).length === 0;
    };
    
    const handleUpdate = async () => {
        if (!validateForm()) {
            setServerError('Por favor, corrige los errores antes de continuar.');
            return;
        }
        
        try {
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
            
            await onUpdate(formData);
        } catch (error) {
            // Manejar errores específicos del servidor
            if (error.response?.data?.message) {
                const message = error.response.data.message.toLowerCase();
                if (message.includes('matrícula') && message.includes('existe')) {
                    setErrors(prev => ({ ...prev, licensePlate: 'Esta matrícula ya está registrada' }));
                } else if (message.includes('vin') && message.includes('existe')) {
                    setErrors(prev => ({ ...prev, vin: 'Este VIN ya está registrado' }));
                } else {
                    setServerError(error.response.data.message);
                }
            } else {
                setServerError('Error al actualizar el coche. Por favor, inténtalo de nuevo.');
            }
        }
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
                
                {serverError && (
                    <div className="mb-4 p-3 bg-red-accent/10 border border-red-accent/20 rounded-lg">
                        <p className="text-sm text-red-accent flex items-center gap-2">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />
                            {serverError}
                        </p>
                    </div>
                )}
                
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
                            {errors.image && (
                                <p className="mt-1 text-xs text-red-accent flex items-center gap-1">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3" />
                                    {errors.image}
                                </p>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField 
                                label="Marca" 
                                name="make" 
                                value={editedCar.make} 
                                onChange={handleChange} 
                                icon={faCar} 
                                error={errors.make}
                                required
                            />
                            <InputField 
                                label="Modelo" 
                                name="model" 
                                value={editedCar.model} 
                                onChange={handleChange} 
                                icon={faStar} 
                                error={errors.model}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField 
                                label="Matrícula" 
                                name="licensePlate" 
                                value={editedCar.licensePlate} 
                                onChange={handleChange} 
                                icon={faIdCard} 
                                error={errors.licensePlate}
                                required
                            />
                            <InputField 
                                label="Nº de Bastidor" 
                                name="vin" 
                                value={editedCar.vin} 
                                onChange={handleChange} 
                                icon={faFingerprint} 
                                error={errors.vin}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField 
                                label="Fecha de Matriculación" 
                                name="registrationDate" 
                                type="date" 
                                value={editedCar.registrationDate ? editedCar.registrationDate.split('T')[0] : ''} 
                                onChange={handleChange} 
                                icon={faCalendarDay}
                                error={errors.registrationDate}
                            />
                            <InputField 
                                label="Precio de Venta (€)" 
                                name="price" 
                                type="text" 
                                inputMode="decimal" 
                                value={editedCar.price} 
                                onChange={handleChange} 
                                icon={faEuroSign} 
                                error={errors.price}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <InputField 
                                label="Kilómetros" 
                                name="km" 
                                type="text" 
                                inputMode="decimal" 
                                value={editedCar.km} 
                                onChange={handleChange} 
                                icon={faRoad} 
                                error={errors.km}
                            />
                             <InputField 
                                label="Caballos (CV)" 
                                name="horsepower" 
                                type="text" 
                                inputMode="decimal" 
                                value={editedCar.horsepower} 
                                onChange={handleChange} 
                                icon={faBolt} 
                                error={errors.horsepower}
                            />
                        </div>
                        <AutocompleteField 
                            label="Ubicación" 
                            name="location" 
                            value={editedCar.location} 
                            onChange={handleChange} 
                            options={locations} 
                            icon={faMapMarkerAlt}
                            error={errors.location}
                        />
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
                        <TextareaField 
                            label="Anotaciones" 
                            name="notes" 
                            value={editedCar.notes} 
                            onChange={handleChange} 
                            placeholder="Añade cualquier anotación relevante sobre el coche..." 
                            error={errors.notes}
                        />
                    </div>
                </form>
                
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button 
                        onClick={handleUpdate} 
                        disabled={Object.keys(errors).length > 0}
                        className={`px-4 py-2 rounded-lg shadow-sm transition-opacity ${
                            Object.keys(errors).length > 0
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-blue-accent text-white hover:opacity-90'
                        }`}
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCarModal;