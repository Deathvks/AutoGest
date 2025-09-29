// autogest-app/frontend/src/components/modals/AddCarModal.jsx
import React, { useState, useMemo, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';

import InsuranceConfirmationModal from './InsuranceConfirmationModal';
import AddCarFormFields from './AddCar/AddCarFormFields';
import AddCarFileUploads from './AddCar/AddCarFileUploads';

const AddCarModal = ({ onClose, onAdd, locations }) => {
    const { user } = useContext(AuthContext);

    const [newCar, setNewCar] = useState({
        make: '', model: '', licensePlate: '', vin: '', registrationDate: new Date().toISOString().split('T')[0],
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

    const fuelOptions = useMemo(() => [ { id: 'Gasolina', name: 'Gasolina' }, { id: 'Diesel', name: 'Diesel' }, { id: 'Híbrido', name: 'Híbrido' }, { id: 'Eléctrico', name: 'Eléctrico' } ], []);
    const transmissionOptions = useMemo(() => [ { id: 'Manual', name: 'Manual' }, { id: 'Automático', name: 'Automático' } ], []);
    const locationOptions = useMemo(() => {
        const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));
        return [{ id: '', name: 'Seleccionar existente...' }, ...sortedLocations];
    }, [locations]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // --- INICIO DE LA MODIFICACIÓN ---
        const finalValue = type === 'checkbox' ? checked : (typeof value === 'string' ? value.toUpperCase() : value);
        setNewCar(prev => ({ ...prev, [name]: finalValue }));
        // --- FIN DE LA MODIFICACIÓN ---
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
        if ((user.role === 'admin' || user.role === 'technician') && !newCar.purchasePrice.trim()) {
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
                else if (key === 'purchasePrice' && !value) {
                    // No hacer nada
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
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
                <div className="bg-component-bg rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                        <h2 className="text-xl font-bold text-text-primary">AÑADIR NUEVO COCHE</h2>
                        <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                            <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} noValidate className="flex-grow overflow-y-auto p-6 space-y-4">
                        <AddCarFileUploads
                            imagePreview={imagePreview}
                            handleImageChange={handleImageChange}
                            technicalSheetFiles={technicalSheetFiles}
                            registrationCertificateFiles={registrationCertificateFiles}
                            otherDocumentFiles={otherDocumentFiles}
                            handleFileChange={handleFileChange}
                            handleRemoveFile={handleRemoveFile}
                        />
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
                    </form>

                    {error && <p className="flex-shrink-0 px-6 pb-4 text-sm text-red-accent text-center">{error}</p>}

                    <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-border-color">
                        <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold">CANCELAR</button>
                        <button onClick={handleAdd} className="bg-blue-accent text-white px-6 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity font-semibold">AÑADIR COCHE</button>
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