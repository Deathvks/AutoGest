import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faXmark, faUpload, faPaperclip, faBolt
} from '@fortawesome/free-solid-svg-icons';

// --- Componentes de Formulario ---
const InputField = ({ label, name, value, onChange, type = 'text', icon }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-slate-400" />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${icon ? 'pl-9' : ''}`}
            />
        </div>
    </div>
);
const AutocompleteField = ({ label, name, value, onChange, options, icon }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <FontAwesomeIcon icon={icon} className="h-4 w-4 text-slate-400" />
                    </div>
                )}
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    list="location-options"
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${icon ? 'pl-9' : ''}`}
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
const SelectField = ({ label, name, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
        <select name={name} value={value} onChange={onChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
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
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
            <textarea ref={textareaRef} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden" rows="3" />
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

    const handleChange = (e) => {
        const { name, value } = e.target;
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
        setEditedCar(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };
    const validateForm = () => {
        if (!editedCar.make || !editedCar.model || !editedCar.licensePlate || !editedCar.price) {
            setError('Los campos Marca, Modelo, Matrícula y Precio de Venta son obligatorios.');
            return false;
        }
        if (isNaN(parseFloat(editedCar.price)) || parseFloat(editedCar.price) <= 0) {
            setError('El precio de venta debe ser un número válido y mayor que cero.');
            return false;
        }
        setError('');
        return true;
    };
    const handleUpdate = () => {
        if (!validateForm()) return;
        const formData = new FormData();
        Object.keys(editedCar).forEach(key => {
            if (key === 'tags') {
                formData.append(key, JSON.stringify(editedCar[key]));
            } else {
                formData.append(key, editedCar[key]);
            }
        });
        if (imageFile) {
            formData.append('image', imageFile);
        }
        onUpdate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-2xl p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Editar Coche</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Imagen Principal</label>
                            <div className="w-40 h-28 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                <img
                                    src={imagePreview || editedCar.imageUrl || `https://placehold.co/600x400/e2e8f0/1e293b?text=${editedCar.make}+${editedCar.model}`}
                                    alt="Vista previa"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                            <button type="button" onClick={() => imageInputRef.current.click()} className="mt-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium w-40 flex items-center justify-center gap-2">
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
                            <InputField label="Fecha de Matriculación" name="registrationDate" type="date" value={editedCar.registrationDate ? editedCar.registrationDate.split('T')[0] : ''} onChange={handleChange} icon={faCalendarDay} />
                            <InputField label="Precio de Venta (€)" name="price" type="number" value={editedCar.price} onChange={handleChange} icon={faEuroSign} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Kilómetros" name="km" type="number" value={editedCar.km} onChange={handleChange} icon={faRoad} />
                            <InputField label="Caballos (CV)" name="horsepower" type="number" value={editedCar.horsepower} onChange={handleChange} icon={faBolt} />
                        </div>
                        <AutocompleteField label="Ubicación" name="location" value={editedCar.location} onChange={handleChange} options={locations} icon={faMapMarkerAlt} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField label="Combustible" name="fuel" value={editedCar.fuel} onChange={handleChange} options={['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico']} />
                            <SelectField label="Tipo de Cambio" name="transmission" value={editedCar.transmission} onChange={handleChange} options={['Manual', 'Automático']} />
                        </div>
                        <SelectField label="Estado" name="status" value={editedCar.status} onChange={handleChange} options={['En venta', 'Vendido', 'Reservado', 'Taller']} />
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Etiquetas</label>
                            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                                {editedCar.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-sm px-2 py-1 rounded">
                                        {tag}
                                        <button onClick={() => removeTag(tag)}><FontAwesomeIcon icon={faXmark} className="w-3 h-3 text-blue-600 dark:text-blue-200 hover:text-blue-800 dark:hover:text-blue-100" /></button>
                                    </span>
                                ))}
                                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Añadir etiqueta y pulsar Enter" className="flex-1 bg-transparent focus:outline-none text-sm" />
                            </div>
                        </div>
                        <TextareaField label="Anotaciones" name="notes" value={editedCar.notes} onChange={handleChange} placeholder="Añade cualquier anotación relevante sobre el coche..." />
                    </div>
                </form>
                {error && <p className="mt-4 text-sm text-rose-600 text-center">{error}</p>}
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                    <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default EditCarModal;