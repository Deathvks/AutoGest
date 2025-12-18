// autogest-app/frontend/src/components/modals/GeneratePdfModal.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileInvoice, faDownload, faUser, faBuilding, faIdCard, faMapMarkerAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const InputField = ({ label, name, value, onChange, icon, placeholder }) => (
    <div className="mb-3">
        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">{label}</label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon icon={icon} className="h-3 w-3 text-gray-400" />
                </div>
            )}
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors ${icon ? 'pl-9' : ''}`}
            />
        </div>
    </div>
);

// CAMBIO: defaultIgic ahora es 7 por defecto
const GeneratePdfModal = ({ isOpen, onClose, onConfirm, type, defaultNumber, car, defaultIgic = 7 }) => {
    const [number, setNumber] = useState(defaultNumber);
    const [igic, setIgic] = useState(defaultIgic);
    const [clientType, setClientType] = useState('particular');
    const [clientData, setClientData] = useState({
        name: '', lastName: '', dni: '', businessName: '', cif: '',
        streetAddress: '', postalCode: '', city: '', province: '',
        phone: '', email: ''
    });
    const [hasExistingData, setHasExistingData] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNumber(defaultNumber);
            setIgic(defaultIgic);
            setError('');

            let existingData = {};
            let hasData = false;

            if (car && car.buyerDetails) {
                try {
                    const parsed = typeof car.buyerDetails === 'string' ? JSON.parse(car.buyerDetails) : car.buyerDetails;
                    if (parsed && (parsed.name || parsed.businessName)) {
                        existingData = parsed;
                        hasData = true;
                    }
                } catch (e) { }
            }

            setClientData({
                name: existingData.name || '',
                lastName: existingData.lastName || '',
                dni: existingData.dni || '',
                businessName: existingData.businessName || '',
                cif: existingData.cif || '',
                streetAddress: existingData.streetAddress || existingData.address || '',
                postalCode: existingData.postalCode || '',
                city: existingData.city || '',
                province: existingData.province || '',
                phone: existingData.phone || '',
                email: existingData.email || ''
            });

            setClientType(existingData.cif ? 'empresa' : 'particular');
            setHasExistingData(hasData);
        }
    }, [isOpen, defaultNumber, car, defaultIgic]);

    const handleClientChange = (e) => {
        setClientData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleConfirm = () => {
        const num = parseInt(number, 10);
        if (isNaN(num) || num <= 0) {
            setError('El número debe ser válido.');
            return;
        }

        // Validación solo si estamos mostrando el formulario
        if (!hasExistingData) {
            if (clientType === 'empresa') {
                if (!clientData.businessName?.trim() || !clientData.cif?.trim()) {
                    setError('La Razón Social y el CIF son obligatorios.');
                    return;
                }
            } else {
                if (!clientData.name?.trim()) {
                    setError('El Nombre es obligatorio.');
                    return;
                }
            }
        }

        // Enviamos el IGIC seleccionado
        onConfirm(type, num, clientData, igic);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className={`bg-white rounded-lg shadow-2xl w-full ${hasExistingData ? 'max-w-md' : 'max-w-lg max-h-[90vh]'} flex flex-col border border-gray-300 overflow-hidden`}>
                <div className="flex justify-between items-center px-5 py-3 bg-accent text-white">
                    <h2 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
                        <FontAwesomeIcon icon={faFileInvoice} />
                        {type === 'proforma' ? 'Generar Proforma' : 'Generar Factura'}
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>

                <div className={`flex-1 p-6 bg-white ${!hasExistingData ? 'overflow-y-auto no-scrollbar' : ''}`}>

                    {hasExistingData ? (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FontAwesomeIcon icon={faInfoCircle} className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        El documento se generará con los datos del comprador ya registrados.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* FORMULARIO COMPLETO SI NO HAY DATOS */
                        <div className="mb-6 space-y-5">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Datos del Cliente</label>
                                    <div className="flex bg-gray-100 rounded p-0.5 border border-gray-200">
                                        <button onClick={() => setClientType('particular')} className={`px-3 py-0.5 text-[10px] font-bold rounded uppercase ${clientType === 'particular' ? 'bg-white text-accent shadow-sm' : 'text-gray-500'}`}>Particular</button>
                                        <button onClick={() => setClientType('empresa')} className={`px-3 py-0.5 text-[10px] font-bold rounded uppercase ${clientType === 'empresa' ? 'bg-white text-accent shadow-sm' : 'text-gray-500'}`}>Empresa</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 p-3 border border-gray-200 rounded-lg">
                                    {clientType === 'particular' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Nombre" name="name" value={clientData.name} onChange={handleClientChange} icon={faUser} />
                                            <InputField label="Apellidos" name="lastName" value={clientData.lastName} onChange={handleClientChange} />
                                            <div className="col-span-2">
                                                <InputField label="DNI/NIE" name="dni" value={clientData.dni} onChange={handleClientChange} icon={faIdCard} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <InputField label="Razón Social" name="businessName" value={clientData.businessName} onChange={handleClientChange} icon={faBuilding} />
                                            </div>
                                            <div className="col-span-2">
                                                <InputField label="CIF" name="cif" value={clientData.cif} onChange={handleClientChange} icon={faIdCard} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <InputField label="Dirección" name="streetAddress" value={clientData.streetAddress} onChange={handleClientChange} icon={faMapMarkerAlt} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="C. Postal" name="postalCode" value={clientData.postalCode} onChange={handleClientChange} />
                                            <InputField label="Ciudad" name="city" value={clientData.city} onChange={handleClientChange} />
                                        </div>
                                        <div className="mt-3">
                                            <InputField label="Provincia" name="province" value={clientData.province} onChange={handleClientChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN NÚMERO E IGIC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                                Nº {type === 'proforma' ? 'Proforma' : 'Factura'}
                            </label>
                            <input
                                type="number"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 text-lg font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                                IGIC (%)
                            </label>
                            <input
                                type="number"
                                value={igic}
                                onChange={(e) => setIgic(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 text-lg font-medium"
                                step="0.1"
                                min="0"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold rounded-r">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold uppercase text-xs hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2.5 bg-accent text-white rounded-lg font-bold uppercase text-xs hover:bg-accent-hover flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <FontAwesomeIcon icon={faDownload} />
                        Descargar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneratePdfModal;