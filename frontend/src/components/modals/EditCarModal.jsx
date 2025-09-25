// autogest-app/frontend/src/components/modals/EditCarModal.jsx
import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import EditCarFormFields from './EditCar/EditCarFormFields';
import EditCarFileUploads from './EditCar/EditCarFileUploads';

const EditCarModal = ({ car, onClose, onUpdate, locations }) => {
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
            newLocation: ''
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
    
    const fuelOptions = useMemo(() => [ { id: 'Gasolina', name: 'Gasolina' }, { id: 'Diesel', name: 'Diesel' }, { id: 'Híbrido', name: 'Híbrido' }, { id: 'Eléctrico', name: 'Eléctrico' } ], []);
    const transmissionOptions = useMemo(() => [ { id: 'Manual', name: 'Manual' }, { id: 'Automático', name: 'Automático' } ], []);
    const statusOptions = useMemo(() => [ { id: 'En venta', name: 'En venta' }, { id: 'Vendido', name: 'Vendido' }, { id: 'Reservado', name: 'Reservado' }, { id: 'Taller', name: 'Taller' } ], []);

    const handleChange = (e) => setEditedCar(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleLocationSelect = (value) => setEditedCar(prev => ({ ...prev, location: value, newLocation: '' }));
    const handleNewLocationInput = (e) => setEditedCar(prev => ({ ...prev, newLocation: e.target.value, location: '' }));
    const handleSelectChange = (name, value) => setEditedCar(prev => ({ ...prev, [name]: value }));
    
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
            setServerError(`Puedes subir un máximo de ${MAX_FILES[fileType]} archivos para esta sección.`);
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
            if (!editedCar.tags.includes(tagInput.trim()) && tagInput.trim() !== '') {
                setEditedCar(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };
    
    const removeTag = (tagToRemove) => setEditedCar(prev => ({...prev, tags: editedCar.tags.filter(tag => tag !== tagToRemove)}));
    const parseNumber = (str) => (typeof str !== 'string' && typeof str !== 'number' || !str) ? String(str) : String(str).replace(/\./g, '').replace(',', '.');
    
    const handleUpdate = async () => {
        try {
            setServerError('');
            const formData = new FormData();
            
            const selectedLocationObject = locations.find(loc => loc.id === editedCar.location);
            const finalLocation = editedCar.newLocation.trim() || (selectedLocationObject ? selectedLocationObject.name : '');

            // 1. Añadir campos de texto y numéricos
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
            
            // 2. Añadir imagen principal (si se cambió)
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // 3. Añadir nuevos ficheros
            newTechnicalSheetFiles.forEach(file => formData.append('technicalSheet', file));
            newRegistrationCertificateFiles.forEach(file => formData.append('registrationCertificate', file));
            newOtherDocumentFiles.forEach(file => formData.append('otherDocuments', file));

            // 4. Añadir la lista de ficheros a eliminar
            formData.append('filesToRemove', JSON.stringify(filesToRemove));
            
            await onUpdate(formData);
        } catch (error) {
            setServerError(error.message || 'Error al actualizar el coche.');
        }
    };

    return (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary">EDITAR COCHE</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={(e) => e.preventDefault()} noValidate className="flex-grow overflow-y-auto p-6 space-y-4">
                    {serverError && ( <div className="mb-4 p-3 bg-red-accent/10 rounded-lg"><p className="text-sm text-red-accent">{serverError}</p></div> )}
                    
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
                    />
                    
                    <EditCarFormFields
                        editedCar={editedCar}
                        locations={locations}
                        fuelOptions={fuelOptions}
                        transmissionOptions={transmissionOptions}
                        statusOptions={statusOptions}
                        handleChange={handleChange}
                        handleLocationSelect={handleLocationSelect}
                        handleNewLocationInput={handleNewLocationInput}
                        handleSelectChange={handleSelectChange}
                        tagInput={tagInput}
                        setTagInput={setTagInput}
                        handleTagKeyDown={handleTagKeyDown}
                        removeTag={removeTag}
                    />
                </form>
                
                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-border-color"> 
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">CANCELAR</button>
                    <button onClick={handleUpdate} className="px-4 py-2 rounded-lg shadow-sm transition-opacity bg-blue-accent text-white hover:opacity-90">
                        GUARDAR CAMBIOS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCarModal;