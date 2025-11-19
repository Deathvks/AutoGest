// autogest-app/frontend/src/components/modals/AddCarModal.jsx
import React, { useState, useMemo, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCar } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';

import InsuranceConfirmationModal from './InsuranceConfirmationModal';
import AddCarFormFields from './AddCar/AddCarFormFields';
import AddCarFileUploads from './AddCar/AddCarFileUploads';

const AddCarModal = ({ onClose, onAdd, locations }) => {
    const { user } = useContext(AuthContext);

    const [newCar, setNewCar] = useState({
        make: '', model: '', licensePlate: '', vin: '', registrationDate: '',
        purchasePrice: '', price: '', km: '', horsepower: '', location: '',
        newLocation: '', notes: '', tags: [], hasInsurance: false, fuel: '', transmission: '', keys: 1
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [technicalSheetFiles, setTechnicalSheetFiles] = useState([]);
    const [registrationCertificateFiles, setRegistrationCertificateFiles] = useState([]);
    const [otherDocumentFiles, setOtherDocumentFiles] = useState([]);

    const [tagInput, setTagInput] = useState('');
    const [showInsuranceConfirm, setShowInsuranceConfirm] = useState(false);
    
    const canViewSensitiveData = user.role === 'admin' || user.isOwner || !user.companyId;

    const fuelOptions = useMemo(() => [ { id: 'Gasolina', name: 'Gasolina' }, { id: 'Diesel', name: 'Diesel' }, { id: 'Híbrido', name: 'Híbrido' }, { id: 'Eléctrico', name: 'Eléctrico' } ], []);
    const transmissionOptions = useMemo(() => [ { id: 'Manual', name: 'Manual' }, { id: 'Automático', name: 'Automático' } ], []);
    const locationOptions = useMemo(() => {
        const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));
        return [{ id: '', name: 'Seleccionar existente...' }, ...sortedLocations];
    }, [locations]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : (typeof value === 'string' ? value.toUpperCase() : value);
        setNewCar(prev => ({ ...prev, [name]: finalValue }));
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
            technicalSheet: setTechnicalSheetFiles,
            registrationCertificate: setRegistrationCertificateFiles,
            otherDocuments: setOtherDocumentFiles,
        };
        const currentFiles = {
            technicalSheet: technicalSheetFiles,
            registrationCertificate: registrationCertificateFiles,
            otherDocuments: otherDocumentFiles,
        };
        const MAX_FILES = { technicalSheet: 2, registrationCertificate: 2, otherDocuments: 6 };

        if (currentFiles[fileType].length + newFiles.length > MAX_FILES[fileType]) {
            setError(`Puedes subir un máximo de ${MAX_FILES[fileType]} archivos para esta sección.`);
            setTimeout(() => setError(''), 4000);
            return;
        }
        setters[fileType](prev => [...prev, ...newFiles]);
    };

    const handleRemoveFile = (fileToRemove, fileType) => {
        const setters = {
            technicalSheet: setTechnicalSheetFiles,
            registrationCertificate: setRegistrationCertificateFiles,
            otherDocuments: setOtherDocumentFiles,
        };
        setters[fileType](prev => prev.filter(file => file !== fileToRemove));
    };

    const handleLocationSelect = (value) => setNewCar(prev => ({ ...prev, location: value, newLocation: '' }));
    const handleNewLocationInput = (e) => setNewCar(prev => ({ ...prev, newLocation: e.target.value.toUpperCase(), location: '' }));
    const handleSelectChange = (name, value) => setNewCar(prev => ({ ...prev, [name]: value }));

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput) {
            e.preventDefault();
            if (!newCar.tags.includes(tagInput.trim().toUpperCase()) && tagInput.trim() !== '') {
                setNewCar(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim().toUpperCase()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => setNewCar(prev => ({...prev, tags: prev.tags.filter(tag => tag !== tagToRemove)}));
    const parseNumber = (str) => (typeof str !== 'string' || !str) ? '' : str.replace(/\./g, '').replace(',', '.');

    const validateForm = () => {
        const errors = {};
        if (!newCar.make.trim()) errors.make = 'LA MARCA ES OBLIGATORIA';
        if (!newCar.model.trim()) errors.model = 'EL MODELO ES OBLIGATORIO';
        if (!newCar.licensePlate.trim()) errors.licensePlate = 'LA MATRÍCULA ES OBLIGATORIA';
        if (canViewSensitiveData && !newCar.purchasePrice.trim()) {
            errors.purchasePrice = 'EL PRECIO DE COMPRA ES OBLIGATORIO';
        }
        if (!newCar.price.trim()) errors.price = 'EL PRECIO DE VENTA ES OBLIGATORIO';

        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            setError('POR FAVOR, CORRIGE LOS ERRORES MARCADOS.');
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
                if (key === 'tags') formData.append(key, JSON.stringify(value));
                else if (key === 'purchasePrice' && !canViewSensitiveData) {
                    // No añadir el precio de compra si no hay permisos
                }
                else if (value !== null && value !== undefined && value !== '') formData.append(key, value);
            });

            if (imageFile) formData.append('image', imageFile);
            technicalSheetFiles.forEach(file => formData.append('technicalSheet', file));
            registrationCertificateFiles.forEach(file => formData.append('registrationCertificate', file));
            otherDocumentFiles.forEach(file => formData.append('otherDocuments', file));

            await onAdd(formData);
        } catch (error) {
            setError(error.message || 'Error al añadir el coche.');
        }
    };

    const handleAdd = () => {
        if (!validateForm()) return;
        if (!newCar.hasInsurance) setShowInsuranceConfirm(true);
        else proceedWithAdd();
    };

    return (
       <>
           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-300 overflow-hidden">
                    {/* Header Rojo Occident */}
                    <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full">
                                <FontAwesomeIcon icon={faCar} className="text-white w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold uppercase tracking-wide">Nuevo Vehículo</h2>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-white/60 hover:text-white transition-colors p-1 focus:outline-none" // Cambiado aquí: quitado hover:bg-white/20 y redondeo innecesario
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} noValidate className="flex-grow overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
                        <AddCarFileUploads
                            imagePreview={imagePreview}
                            handleImageChange={handleImageChange}
                            technicalSheetFiles={technicalSheetFiles}
                            registrationCertificateFiles={registrationCertificateFiles}
                            otherDocumentFiles={otherDocumentFiles}
                            handleFileChange={handleFileChange}
                            handleRemoveFile={handleRemoveFile}
                        />
                        
                        <div className="pt-4 border-t border-gray-100">
                            <AddCarFormFields
                                newCar={newCar}
                                fieldErrors={fieldErrors}
                                locations={locationOptions}
                                fuelOptions={fuelOptions}
                                transmissionOptions={transmissionOptions}
                                handleChange={handleChange}
                                handleLocationSelect={handleLocationSelect}
                                handleNewLocationInput={handleNewLocationInput}
                                handleSelectChange={handleSelectChange}
                                handleTagKeyDown={handleTagKeyDown}
                                tagInput={tagInput}
                                setTagInput={setTagInput}
                                removeTag={removeTag}
                            />
                        </div>
                    </form>

                    {error && (
                        <div className="flex-shrink-0 px-6 pb-4">
                            <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold uppercase rounded-r">
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Footer Gris Claro */}
                    <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50">
                        <button 
                            onClick={onClose} 
                            className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleAdd} 
                            className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                        >
                            Añadir Coche
                        </button>
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