// autogest-app/frontend/src/components/modals/GeneratePdfModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileInvoice, faPercentage } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Select from '../Select';

const GeneratePdfModal = ({ isOpen, onClose, onConfirm, type, defaultNumber, car }) => {
    const { refreshUser } = useContext(AuthContext);
    const [number, setNumber] = useState(defaultNumber);
    const [error, setError] = useState('');
    const [igicRate, setIgicRate] = useState('7'); // El IGIC por defecto
    
    const igicOptions = [
        { id: '0', name: '0% (Exento)' },
        { id: '3', name: '3% (Reducido)' },
        { id: '7', name: '7% (General)' },
        { id: '9.5', name: '9.5% (Incrementado)' },
        { id: '13.5', name: '13.5% (Especial)' },
    ];

    useEffect(() => {
        setNumber(defaultNumber);
    }, [defaultNumber]);

    const handleConfirm = async () => {
        const num = parseInt(number, 10);
        if (isNaN(num) || num <= 0) {
            setError('El número debe ser un valor positivo.');
            return;
        }

        try {
            const fieldToUpdate = type === 'proforma' ? 'proformaCounter' : 'invoiceCounter';
            const numberField = type === 'proforma' ? 'proformaNumber' : 'invoiceNumber';

            await api.updateCar(car.id, { [numberField]: num });
            
            await api.updateProfile({ [fieldToUpdate]: num + 1 });
            
            await refreshUser();
            
            onConfirm(type, num, parseFloat(igicRate));
        } catch (err) {
            setError(err.message || 'Error al actualizar los datos.');
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

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <p className="text-text-secondary text-center">
                        Introduce el número para la {type === 'proforma' ? 'proforma' : 'factura'} o usa el siguiente número disponible.
                    </p>
                    <div>
                        <label htmlFor="pdfNumber" className="block text-sm font-semibold text-text-primary mb-1 uppercase">
                            Número de {type === 'proforma' ? 'Proforma' : 'Factura'}
                        </label>
                        <input
                            id="pdfNumber"
                            type="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="w-full px-4 py-2 bg-component-bg-hover border rounded-lg focus:ring-1 focus:border-accent text-text-primary transition-colors border-border-color focus:ring-accent"
                        />
                    </div>
                    {type === 'factura' && (
                        <Select
                            label="Porcentaje de IGIC a aplicar"
                            value={igicRate}
                            onChange={(value) => setIgicRate(value)}
                            options={igicOptions}
                            icon={faPercentage}
                        />
                    )}
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