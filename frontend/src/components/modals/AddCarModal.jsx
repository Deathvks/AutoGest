// autogest-app/frontend/src/components/modals/AddCarModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar, faStar, faIdCard, faFingerprint, faCalendarDay, faRoad, faEuroSign,
    faMapMarkerAlt, faXmark, faUpload, faPaperclip, faBolt
} from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';

// --- Iconos (para botones especiales) ---
const SparklesIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.94 14.32c.32-.32.44-.78.34-1.22-.1-.44-.4-.74-.84-.84-.44-.1-.9.02-1.22.34l-3.5 3.5c-.98.98-.98 2.56 0 3.54.98.98 2.56.98 3.54 0l1.68-1.68"/><path d="m21.66 3.34-3.5 3.5c-.98.98-.98 2.56 0 3.54.98.98 2.56.98 3.54 0l1.68-1.68"/><path d="M14.32 9.94c.32.32.78.44 1.22.34.44-.1.74-.4.84-.84.1-.44-.02-.9-.34-1.22l-3.5-3.5c-.98-.98-2.56-.98-3.54 0-.98.98-.98 2.56 0 3.54l1.68 1.68"/><path d="M3.34 21.66l3.5-3.5c.98-.98-.98-2.56 0-3.54-.98-.98-2.56-.98-3.54 0l-1.68 1.68"/></svg> );

// --- Componentes de Formulario ---
const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode }) => (
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
                inputMode={inputMode}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500`} 
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
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
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
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
            <textarea 
                ref={textareaRef} 
                name={name} 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden" 
                rows="3" 
            />
        </div>
    );
};

// --- Componente Principal del Modal ---
const AddCarModal = ({ onClose, onAdd, locations }) => {
    const [newCar, setNewCar] = useState({ make: '', model: '', licensePlate: '', vin: '', km: '', horsepower: '', registrationDate: '', fuel: 'Gasolina', transmission: 'Manual', purchasePrice: '', location: '', status: 'En venta', tags: [], notes: '' });
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [registrationDocumentFile, setRegistrationDocumentFile] = useState(null);

    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
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
        const price = parseFloat(parseNumber(newCar.purchasePrice));
        if (!newCar.make || !newCar.model || !newCar.licensePlate || !newCar.purchasePrice) {
            setError('Los campos Marca, Modelo, Matrícula y Precio de Compra son obligatorios.');
            return false;
        }
        if (isNaN(price) || price <= 0) {
            setError('El precio de compra debe ser un número válido y mayor que cero.');
            return false;
        }
        setError('');
        return true;
    };

    const handleAdd = () => {
        if (!validateForm()) return;
        
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
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });
        if (imageFile) formData.append('image', imageFile);
        if (registrationDocumentFile) formData.append('registrationDocument', registrationDocumentFile);
        onAdd(formData);
    };

    const handleImageAnalysis = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsAnalyzing(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64ImageData = reader.result.split(',')[1];
            const prompt = `Extrae los detalles del vehículo de esta imagen. Responde SÓLO con un objeto JSON válido con las claves: "make", "model", "licensePlate", "vin", "registrationDate" (formato YYYY-MM-DD), "fuel". Si un valor no se encuentra, usa null.`;
            try {
                const payload = { contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: file.type, data: base64ImageData } }] }] };
                const apiKey = "";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision-latest:generateContent?key=${apiKey}`;
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) throw new Error(`Error de la API: ${response.statusText}`);
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsedData = JSON.parse(cleanedText);
                    setNewCar(prev => ({
                        ...prev,
                        make: parsedData.make || prev.make,
                        model: parsedData.model || prev.model,
                        licensePlate: parsedData.licensePlate || prev.licensePlate,
                        vin: parsedData.vin || prev.vin,
                        registrationDate: parsedData.registrationDate || prev.registrationDate,
                        fuel: parsedData.fuel || prev.fuel,
                    }));
                }
            } catch (error) {
                console.error("Error al analizar la imagen:", error);
                alert("No se pudieron extraer los datos de la imagen. Verifica tu API Key o introduce los datos manualmente.");
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.onerror = error => {
            console.error("Error al leer el archivo:", error);
            setIsAnalyzing(false);
        };
    };

    return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-2xl p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Añadir Nuevo Coche</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Imagen Principal</label>
                                <div className="w-40 h-28 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? ( <img src={imagePreview} alt="Vista previa" className="h-full w-full object-cover" /> ) : ( <span className="text-xs text-slate-400">Sin imagen</span> )}
                                </div>
                                <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                                <button type="button" onClick={() => imageInputRef.current.click()} className="mt-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium w-40 flex items-center justify-center gap-2">
                                    <FontAwesomeIcon icon={faUpload} />
                                    Seleccionar
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Analizar Ficha Técnica</label>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageAnalysis} className="hidden" />
                                <button onClick={() => fileInputRef.current.click()} disabled={isAnalyzing} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 disabled:opacity-50">
                                    {isAnalyzing ? 'Analizando...' : <> <SparklesIcon className="w-5 h-5 text-blue-500" /> Rellenar con IA </>}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Marca" name="make" value={newCar.make} onChange={handleChange} icon={faCar} />
                            <InputField label="Modelo" name="model" value={newCar.model} onChange={handleChange} icon={faStar} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Matrícula" name="licensePlate" value={newCar.licensePlate} onChange={handleChange} icon={faIdCard} />
                            <InputField label="Nº de Bastidor" name="vin" value={newCar.vin} onChange={handleChange} icon={faFingerprint} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Fecha de Matriculación" name="registrationDate" type="date" value={newCar.registrationDate} onChange={handleChange} />
                            <InputField label="Precio de Compra (€)" name="purchasePrice" type="text" inputMode="decimal" value={newCar.purchasePrice} onChange={handleChange} icon={faEuroSign} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <InputField label="Kilómetros" name="km" type="text" inputMode="decimal" value={newCar.km} onChange={handleChange} icon={faRoad} />
                             <InputField label="Caballos (CV)" name="horsepower" type="text" inputMode="decimal" value={newCar.horsepower} onChange={handleChange} icon={faBolt} />
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
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Permiso de Circulación</label>
                            <div className="flex items-center gap-2 mt-2">
                                <button type="button" onClick={() => documentInputRef.current.click()} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium flex-grow flex items-center justify-center gap-2">
                                    <FontAwesomeIcon icon={faPaperclip} />
                                    <span>{registrationDocumentFile ? 'Cambiar archivo' : 'Subir archivo (PDF o Imagen)'}</span>
                                </button>
                                <input type="file" accept="image/*,application/pdf" ref={documentInputRef} onChange={handleDocumentChange} className="hidden" />
                            </div>
                            {registrationDocumentFile && (
                                <p className="text-xs text-slate-500 mt-2">Archivo seleccionado: {registrationDocumentFile.name}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Etiquetas</label>
                            <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                {newCar.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-sm px-2 py-1 rounded">
                                        {tag}
                                        <button onClick={() => removeTag(tag)}><FontAwesomeIcon icon={faXmark} className="w-3 h-3 text-blue-600 dark:text-blue-200 hover:text-blue-800 dark:hover:text-blue-100" /></button>
                                    </span>
                                ))}
                                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Añadir etiqueta y pulsar Enter" className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm min-w-[150px]" />
                            </div>
                        </div>
                        <TextareaField label="Anotaciones" name="notes" value={newCar.notes} onChange={handleChange} placeholder="Añade cualquier anotación relevante sobre el coche..." />
                    </div>
                </form>
                {error && <p className="mt-4 text-sm text-rose-600 text-center">{error}</p>}
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                    <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Añadir Coche</button>
                </div>
            </div>
        </div>
    );
};

export default AddCarModal;