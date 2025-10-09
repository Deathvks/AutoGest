// autogest-app/frontend/src/components/modals/GeneratePdfModal.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileInvoice, faPercentage } from '@fortawesome/free-solid-svg-icons';
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

    useEffect(() => {
        if (isOpen) {
            setNumber(defaultNumber);
            setObservations('');
        }
    }, [defaultNumber, isOpen]);

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

            await api.updateCar(car.id, { [numberField]: num });
            
            await api.updateProfile({ [fieldToUpdate]: num + 1 });
            
            await refreshUser();
            
            onConfirm(type, num, rate, observations);
        } catch (err) {
            setError(err.message || 'Error al guardar los datos.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-border-color">
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
                    <p className="text-text-secondary text-center">
                        Introduce el número para la {type === 'proforma' ? 'proforma' : 'factura'} o usa el siguiente número disponible.
                    </p>
                    <InputField
                        label={`Número de ${type === 'proforma' ? 'Proforma' : 'Factura'}`}
                        name="pdfNumber"
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                    />
                    
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