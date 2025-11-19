// autogest-app/frontend/src/components/modals/GeneratePdfModal.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileInvoice, faPercentage, faCreditCard, faUser, faBuilding, faIdCard, faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const InputField = ({ label, name, value, onChange, type = 'text', icon, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-bold text-gray-700 mb-1 uppercase">
            {label}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" />
                </div>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors ${icon ? 'pl-11' : ''}`}
            />
        </div>
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
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">{label}</label>
            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 resize-none overflow-hidden"
                rows="3"
            />
        </div>
    );
};

const GeneratePdfModal = ({ isOpen, onClose, onConfirm, type, defaultNumber, car }) => {
    const { refreshUser } = useContext(AuthContext);
    const [number, setNumber] = useState(defaultNumber);
    const [error, setError] = useState('');
    const [igicRate, setIgicRate] = useState('7');
    const [observations, setObservations] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [clientType, setClientType] = useState('particular');
    const [clientData, setClientData] = useState({
        name: '',
        lastName: '',
        dni: '',
        businessName: '',
        cif: '',
        phone: '',
        email: '',
        streetAddress: '',
        postalCode: '',
        city: '',
        province: '',
    });

    useEffect(() => {
        if (isOpen) {
            setNumber(defaultNumber);
            setObservations('');
            setPaymentMethod('');
            
            let buyer = {};
            if (car.buyerDetails) {
                try {
                    buyer = typeof car.buyerDetails === 'string' ? JSON.parse(car.buyerDetails) : car.buyerDetails;
                } catch (e) { console.error("Error parsing buyer data:", e); }
            }
            
            setClientData({
                name: buyer.name || '',
                lastName: buyer.lastName || '',
                dni: buyer.dni || '',
                businessName: buyer.businessName || '',
                cif: buyer.cif || '',
                phone: buyer.phone || '',
                email: buyer.email || '',
                streetAddress: buyer.streetAddress || buyer.address || '',
                postalCode: buyer.postalCode || '',
                city: buyer.city || '',
                province: buyer.province || '',
            });
            
            setClientType(buyer.cif ? 'empresa' : 'particular');

        }
    }, [defaultNumber, isOpen, car]);

    const handleConfirm = async () => {
        const num = parseInt(number, 10);
        if (isNaN(num) || num <= 0) {
            setError('El número debe ser un valor positivo.');
            return;
        }

        const rate = parseFloat(igicRate);
        if (type === 'factura' && (isNaN(rate) || rate < 0)) {
            setError('El IGIC debe ser un número válido.');
            return;
        }

        try {
            const fieldToUpdate = type === 'proforma' ? 'proformaCounter' : 'invoiceCounter';
            const numberField = type === 'proforma' ? 'proformaNumber' : 'invoiceNumber';
            
            await api.updateCar(car.id, { [numberField]: num, buyerDetails: JSON.stringify(clientData) });
            
            await api.updateProfile({ [fieldToUpdate]: num + 1 });
            
            await refreshUser();
            
            onConfirm(type, num, rate, observations, paymentMethod, clientData);
        } catch (err) {
            setError(err.message || 'Error al guardar los datos.');
        }
    };
    
    const handleClientDataChange = (e) => {
        setClientData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-300 overflow-hidden">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <h2 className="text-lg font-bold text-white flex items-center gap-3 uppercase tracking-wide">
                        <FontAwesomeIcon icon={faFileInvoice} />
                        GENERAR {type === 'proforma' ? 'PROFORMA' : 'FACTURA'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar bg-white">
                    <InputField
                        label={`Número de ${type === 'proforma' ? 'Proforma' : 'Factura'}`}
                        name="pdfNumber"
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                    />

                    <div className="pt-4 border-t border-gray-100">
                         <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Datos del Cliente</h3>
                         
                         <div className="flex w-full items-center rounded-lg bg-gray-100 p-1 border border-gray-200 mb-4">
                            <button
                                type="button"
                                onClick={() => setClientType('particular')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors uppercase ${
                                    clientType === 'particular' ? 'bg-white text-accent shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                AUTÓNOMO
                            </button>
                             <button
                                type="button"
                                onClick={() => setClientType('empresa')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors uppercase ${
                                    clientType === 'empresa' ? 'bg-white text-accent shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                EMPRESA
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {clientType === 'particular' ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField label="Nombre" name="name" value={clientData.name} onChange={handleClientDataChange} icon={faUser} />
                                        <InputField label="Apellidos" name="lastName" value={clientData.lastName} onChange={handleClientDataChange} />
                                    </div>
                                    <InputField label="DNI / NIE" name="dni" value={clientData.dni} onChange={handleClientDataChange} icon={faIdCard} />
                                </>
                            ) : (
                                <>
                                     <InputField label="Razón Social" name="businessName" value={clientData.businessName} onChange={handleClientDataChange} icon={faBuilding} />
                                     <InputField label="CIF" name="cif" value={clientData.cif} onChange={handleClientDataChange} icon={faFileInvoice} />
                                </>
                            )}
                             <InputField label="Dirección" name="streetAddress" value={clientData.streetAddress} onChange={handleClientDataChange} icon={faMapMarkerAlt} />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Código Postal" name="postalCode" value={clientData.postalCode} onChange={handleClientDataChange} />
                                <InputField label="Ciudad" name="city" value={clientData.city} onChange={handleClientDataChange} />
                            </div>
                            <InputField label="Provincia" name="province" value={clientData.province} onChange={handleClientDataChange} />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Teléfono" name="phone" value={clientData.phone} onChange={handleClientDataChange} icon={faPhone} />
                                <InputField label="Email" name="email" value={clientData.email} onChange={handleClientDataChange} icon={faEnvelope} />
                            </div>
                        </div>
                    </div>
                    
                    {type === 'factura' && (
                        <InputField
                            label="Porcentaje de IGIC a aplicar"
                            name="igicRate"
                            type="number"
                            value={igicRate}
                            onChange={(e) => setIgicRate(e.target.value)}
                            icon={faPercentage}
                        />
                    )}
                    
                    <InputField
                        label="Métodos de Pago (Opcional)"
                        name="paymentMethod"
                        type="text"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        icon={faCreditCard}
                    />

                    <TextareaField
                        label="Observaciones (Opcional)"
                        name="observations"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Añade aquí cualquier aclaración o nota..."
                    />

                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold uppercase rounded-r">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end items-center gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose} 
                        className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Generar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneratePdfModal;