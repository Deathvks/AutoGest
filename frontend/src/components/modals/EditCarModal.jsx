// autogest-app/frontend/src/components/modals/EditCarModal.jsx
import React, { useState, useMemo, useContext, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCar, faStar, faIdCard, faFingerprint, faRoad, faEuroSign, faMapMarkerAlt, faBolt, faKey, faGasPump, faCogs, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import EditCarFileUploads from './EditCar/EditCarFileUploads';
import Select from '../Select';
import DatePicker from '../DatePicker';

const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, required = false, placeholder = '' }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" />
                </div>
            )}
            <input
                type={type} name={name} value={value || ''} onChange={onChange} inputMode={inputMode} placeholder={placeholder}
                className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors ${icon ? 'pl-11' : ''}`}
            />
        </div>
    </div>
);

const KeySelector = ({ label, icon, value, onChange }) => (
     <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
        <label className="flex items-center text-sm font-bold text-gray-700 uppercase">
            <FontAwesomeIcon icon={icon} className="h-4 w-4 text-accent mr-3" />
            {label}
        </label>
        <div className="flex items-center rounded-lg bg-white p-1 border border-gray-200 text-gray-500">
            {[1, 2, 3].map(num => (
                <button
                    key={num}
                    type="button"
                    onClick={() => onChange(num)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${value === num ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200' : 'hover:bg-gray-50'}`}
                >
                    {num}
                </button>
            ))}
        </div>
    </div>
);


const EditCarModal = ({ car, onClose, onUpdate, locations }) => {
    const { user } = useContext(AuthContext);
    const [editedCar, setEditedCar] = useState(() => {
        const currentLocation = locations.find(loc => loc.name === car.location);
        const safeParse = (jsonString) => {
            if (Array.isArray(jsonString)) return jsonString;
            try {
                const parsed = JSON.parse(jsonString);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        };

        return {
            ...car,
            tags: safeParse(car.tags),
            technicalSheetUrl: safeParse(car.technicalSheetUrl),
            registrationCertificateUrl: safeParse(car.registrationCertificateUrl),
            otherDocumentsUrls: safeParse(car.otherDocumentsUrls),
            location: currentLocation ? currentLocation.id : '',
            keys: car.keys || 1,
            newLocation: '',
            fuel: car.fuel || '',
            transmission: car.transmission || '',
            status: car.status || 'En venta',
            registrationDate: car.registrationDate ? new Date(car.registrationDate).toISOString().split('T')[0] : '',
        };
    });

    const [tagInput, setTagInput] = useState('');
    const [serverError, setServerError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [newTechnicalSheetFiles, setNewTechnicalSheetFiles] = useState([]);
    const [newRegistrationCertificateFiles, setNewRegistrationCertificateFiles] = useState([]);
    const [newOtherDocumentFiles, setNewOtherDocumentFiles] = useState([]);
    const [filesToRemove, setFilesToRemove] = useState([]);

    const canViewSensitiveData = user.role === 'admin' || user.isOwner || !user.companyId;

    const fuelOptions = useMemo(() => [ { id: '', name: 'SELECCIONA...' }, { id: 'Gasolina', name: 'Gasolina' }, { id: 'Diesel', name: 'Diesel' }, { id: 'Híbrido', name: 'Híbrido' }, { id: 'Eléctrico', name: 'Eléctrico' } ], []);
    const transmissionOptions = useMemo(() => [ { id: '', name: 'SELECCIONA...' }, { id: 'Manual', name: 'Manual' }, { id: 'Automático', name: 'Automático' } ], []);
    const statusOptions = useMemo(() => [ { id: 'En venta', name: 'En venta' }, { id: 'Vendido', name: 'Vendido' }, { id: 'Reservado', name: 'Reservado' }, { id: 'Taller', name: 'Taller' } ], []);
    const locationOptions = useMemo(() => {
        const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));
        return [{ id: '', name: 'SELECCIONAR EXISTENTE...' }, ...sortedLocations];
    }, [locations]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const fieldsToUppercase = ['make', 'model', 'licensePlate', 'vin'];
        
        if (typeof value === 'string' && fieldsToUppercase.includes(name)) {
            setEditedCar(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setEditedCar(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSelectChange = useCallback((name, value) => {
        setEditedCar(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleDateChange = (date) => {
        setEditedCar(prev => ({ ...prev, registrationDate: date || '' }));
    };

    const handleLocationSelect = useCallback((value) => {
        setEditedCar(prev => ({ ...prev, location: value, newLocation: '' }));
    }, []);
    
    const handleNewLocationInput = (e) => {
        setEditedCar(prev => ({ ...prev, newLocation: e.target.value.toUpperCase(), location: '' }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFileChange = (e, fileType) => {
        const newFiles = Array.from(e.target.files);
        const setters = {
            technicalSheet: setNewTechnicalSheetFiles,
            registrationCertificate: setNewRegistrationCertificateFiles,
            otherDocuments: setNewOtherDocumentFiles,
        };
        const currentNewFiles = {
            technicalSheet: newTechnicalSheetFiles,
            registrationCertificate: newRegistrationCertificateFiles,
            otherDocuments: newOtherDocumentFiles,
        };
        const currentExistingFiles = {
            technicalSheet: editedCar.technicalSheetUrl || [],
            registrationCertificate: editedCar.registrationCertificateUrl || [],
            otherDocuments: editedCar.otherDocumentsUrls || [],
        };
        const MAX_FILES = { technicalSheet: 2, registrationCertificate: 2, otherDocuments: 6 };
        const totalCurrentFiles = currentExistingFiles[fileType].length + currentNewFiles[fileType].length;

        if (totalCurrentFiles + newFiles.length > MAX_FILES[fileType]) {
            setServerError(`PUEDES SUBIR UN MÁXIMO DE ${MAX_FILES[fileType]} ARCHIVOS PARA ESTA SECCIÓN.`);
            setTimeout(() => setServerError(''), 4000);
            return;
        }

        setters[fileType](prev => [...prev, ...newFiles]);
    };

    const handleRemoveNewFile = (fileToRemove, fileType) => {
        const setters = {
            technicalSheet: setNewTechnicalSheetFiles,
            registrationCertificate: setNewRegistrationCertificateFiles,
            otherDocuments: setNewOtherDocumentFiles,
        };
        setters[fileType](prev => prev.filter(file => file !== fileToRemove));
    };

    const handleRemoveExistingFile = (fileToRemove, fileType) => {
        setFilesToRemove(prev => [...prev, { path: fileToRemove.path, type: fileType }]);
        const urlField = fileType === 'otherDocuments' ? 'otherDocumentsUrls' : `${fileType}Url`;
        setEditedCar(prev => ({
            ...prev,
            [urlField]: prev[urlField].filter(doc => doc.path !== fileToRemove.path)
        }));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput) {
            e.preventDefault();
            const upperCaseTag = tagInput.trim().toUpperCase();
            if (!editedCar.tags.includes(upperCaseTag) && upperCaseTag !== '') {
                setEditedCar(prev => ({ ...prev, tags: [...prev.tags, upperCaseTag] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => setEditedCar(prev => ({...prev, tags: prev.tags.filter(tag => tag !== tagToRemove)}));
    const parseNumber = (str) => (typeof str !== 'string' && typeof str !== 'number' || !str) ? String(str) : String(str).replace(/\./g, '').replace(',', '.');

    const handleUpdate = async () => {
        try {
            setServerError('');
            const formData = new FormData();

            const selectedLocationObject = locations.find(loc => loc.id === editedCar.location);
            const finalLocation = editedCar.newLocation.trim() || (selectedLocationObject ? selectedLocationObject.name : '');

            formData.append('make', editedCar.make);
            formData.append('model', editedCar.model);
            formData.append('licensePlate', editedCar.licensePlate);
            formData.append('vin', editedCar.vin || '');
            formData.append('registrationDate', editedCar.registrationDate || '');
            formData.append('purchasePrice', parseNumber(editedCar.purchasePrice));
            formData.append('price', parseNumber(editedCar.price));
            formData.append('km', parseNumber(editedCar.km));
            formData.append('horsepower', parseNumber(editedCar.horsepower));
            formData.append('location', finalLocation);
            formData.append('fuel', editedCar.fuel);
            formData.append('transmission', editedCar.transmission);
            formData.append('status', editedCar.status);
            formData.append('keys', editedCar.keys);
            formData.append('hasInsurance', editedCar.hasInsurance);
            formData.append('tags', JSON.stringify(editedCar.tags));

            if (imageFile) {
                formData.append('image', imageFile);
            }

            newTechnicalSheetFiles.forEach(file => formData.append('technicalSheet', file));
            newRegistrationCertificateFiles.forEach(file => formData.append('registrationCertificate', file));
            newOtherDocumentFiles.forEach(file => formData.append('otherDocuments', file));

            formData.append('filesToRemove', JSON.stringify(filesToRemove));

            await onUpdate(formData);
        } catch (error) {
            setServerError(error.message || 'Error al actualizar el coche.');
        }
    };

    return (
       <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-300 overflow-hidden">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faCar} className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Editar Vehículo</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={(e) => e.preventDefault()} noValidate className="flex-grow overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
                    {serverError && (
                        <div className="flex-shrink-0 pb-4">
                             <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold uppercase rounded-r">
                                {serverError}
                            </div>
                        </div>
                    )}

                    <EditCarFileUploads
                        editedCar={editedCar}
                        imagePreview={imagePreview}
                        handleImageChange={handleImageChange}
                        newTechnicalSheetFiles={newTechnicalSheetFiles}
                        newRegistrationCertificateFiles={newRegistrationCertificateFiles}
                        newOtherDocumentFiles={newOtherDocumentFiles}
                        handleFileChange={handleFileChange}
                        handleRemoveNewFile={handleRemoveNewFile}
                        handleRemoveExistingFile={handleRemoveExistingFile}
                        // Pasa el icono del coche si no hay imagen (corregido para usar la prop `carImage` o similar si existiera)
                        // Asumo que `EditCarFileUploads` tiene una lógica interna para decidir si usar imagePreview, editedCar.imageUrl o defaultImage
                        // Si 'EditCarFileUploads' necesita un prop específico para la imagen actual del coche, lo añadiríamos aquí.
                        // Para este ejemplo, aseguro que 'imagePreview' y 'editedCar.imageUrl' se manejen correctamente dentro de 'EditCarFileUploads'.
                        // El `defaultImage` se pasará como un fallback visual.
                        defaultImageComponent={<div className="flex items-center justify-center w-full h-full text-gray-300"><FontAwesomeIcon icon={faCar} className="w-16 h-16" /></div>}
                    />

                    <div className="pt-6 border-t border-gray-100">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Marca" name="make" value={editedCar.make} onChange={handleChange} icon={faCar} required />
                                <InputField label="Modelo" name="model" value={editedCar.model} onChange={handleChange} icon={faStar} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Matrícula" name="licensePlate" value={editedCar.licensePlate} onChange={handleChange} icon={faIdCard} required />
                                <InputField label="Nº de Bastidor" name="vin" value={editedCar.vin} onChange={handleChange} icon={faFingerprint} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {canViewSensitiveData && (
                                    <InputField label="Precio de Compra (€)" name="purchasePrice" type="text" inputMode="decimal" value={editedCar.purchasePrice} onChange={handleChange} icon={faEuroSign} required />
                                )}
                                <InputField label="Precio de Venta (€)" name="price" type="text" inputMode="decimal" value={editedCar.price} onChange={handleChange} icon={faEuroSign} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DatePicker 
                                    label="Fecha de Matriculación"
                                    value={editedCar.registrationDate}
                                    onChange={handleDateChange}
                                    placeholder="DD/MM/AAAA"
                                />
                                <InputField label="Kilómetros" name="km" type="text" inputMode="decimal" value={editedCar.km} onChange={handleChange} icon={faRoad} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Potencia (CV)" name="horsepower" type="text" inputMode="decimal" value={editedCar.horsepower} onChange={handleChange} icon={faBolt} />
                                <KeySelector
                                    label="Nº de Llaves"
                                    icon={faKey}
                                    value={editedCar.keys}
                                    onChange={(value) => handleChange({ target: { name: 'keys', value } })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select label="Ubicación Existente" value={editedCar.location} onChange={handleLocationSelect} options={locationOptions} icon={faMapMarkerAlt} />
                                <InputField label="o Nueva Ubicación" name="newLocation" value={editedCar.newLocation} onChange={handleNewLocationInput} icon={faMapMarkerAlt} placeholder="ESCRIBE PARA CREAR UNA NUEVA" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select label="Combustible" value={editedCar.fuel} onChange={(value) => handleSelectChange('fuel', value)} options={fuelOptions} icon={faGasPump} />
                                <Select label="Tipo de Cambio" value={editedCar.transmission} onChange={(value) => handleSelectChange('transmission', value)} options={transmissionOptions} icon={faCogs} />
                            </div>
                            <Select label="Estado" value={editedCar.status} onChange={(value) => handleSelectChange('status', value)} options={statusOptions} icon={faUserShield} />
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">Etiquetas</label>
                                <div className="flex flex-wrap items-center gap-2 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-accent focus-within:border-accent">
                                    {editedCar.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1.5 bg-red-50 text-accent text-xs font-bold px-2.5 py-1 rounded border border-red-100 uppercase">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="hover:text-red-800 transition-colors"><FontAwesomeIcon icon={faXmark} className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                    <input 
                                        type="text" 
                                        value={tagInput} 
                                        onChange={(e) => setTagInput(e.target.value)} 
                                        onKeyDown={handleTagKeyDown} 
                                        placeholder="AÑADIR Y PULSAR ENTER" 
                                        className="flex-1 bg-transparent !border-0 !ring-0 !outline-none !shadow-none focus:!ring-0 p-0 text-gray-900 text-sm placeholder:text-gray-400 min-w-[150px] uppercase" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose} 
                        className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleUpdate} 
                        className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCarModal;