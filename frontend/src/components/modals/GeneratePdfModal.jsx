// autogest-app/frontend/src/components/modals/GeneratePdfModal.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileInvoice, faPercentage, faCreditCard, faUser, faBuilding, faIdCard, faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const InputField = ({ label, name, value, onChange, type = 'text', icon }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-text-primary mb-1 uppercase">
            {label}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
                </div>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-2 bg-component-bg-hover border rounded-lg focus:ring-1 focus:border-accent text-text-primary transition-colors border-border-color focus:ring-accent ${icon ? 'pl-11' : ''}`}
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
            <label className="block text-sm font-semibold text-text-primary mb-1 uppercase">{label}</label>
            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-secondary/70 resize-none overflow-hidden no-scrollbar"
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
    const [clientData, setClientData] = useState({});

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
            // --- INICIO DE LA MODIFICACIÓN ---
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
            // --- FIN DE LA MODIFICACIÓN ---
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-border-color">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
                        <FontAwesomeIcon icon={faFileInvoice} />
                        GENERAR {type === 'proforma' ? 'PROFORMA' : 'FACTURA'}
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
                    <InputField
                        label={`Número de ${type === 'proforma' ? 'Proforma' : 'Factura'}`}
                        name="pdfNumber"
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                    />

                    <div className="pt-4 border-t border-border-color">
                         <h3 className="text-lg font-semibold text-text-primary mb-4">Datos del Cliente</h3>
                         <div className="relative flex w-full items-center rounded-full bg-component-bg-hover p-1 border border-border-color overflow-hidden mb-4">
                            <span
                                className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-1/2 rounded-full bg-component-bg backdrop-blur-sm shadow-lg transition-transform duration-300 ${
                                    clientType === 'empresa' ? 'translate-x-[96%]' : 'translate-x-0'
                                }`}
                                style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                            />
                            <button type="button" onClick={() => setClientType('particular')} className={`relative z-10 flex-1 rounded-full py-1.5 text-sm font-semibold transition-colors duration-300 ${clientType === 'particular' ? 'text-text-primary' : 'text-text-secondary'}`}>
                                PARTICULAR / AUTÓNOMO
                            </button>
                             <button type="button" onClick={() => setClientType('empresa')} className={`relative z-10 flex-1 rounded-full py-1.5 text-sm font-semibold transition-colors duration-300 ${clientType === 'empresa' ? 'text-text-primary' : 'text-text-secondary'}`}>
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
                            {/* --- INICIO DE LA MODIFICACIÓN --- */}
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
                            {/* --- FIN DE LA MODIFICACIÓN --- */}
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

                    {error && <p className="mt-2 text-sm text-red-accent text-center font-semibold uppercase">{error}</p>}
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end items-center gap-4 p-4 border-t border-border-color">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold uppercase">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold uppercase">Generar PDF</button>
                </div>
            </div>
        </div>
    );
};

export default GeneratePdfModal;