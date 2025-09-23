// autogest-app/frontend/src/components/modals/GeneratePdfModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const GeneratePdfModal = ({ isOpen, onClose, onConfirm, type, defaultNumber, car }) => {
    const { refreshUser } = useContext(AuthContext);
    const [number, setNumber] = useState(defaultNumber);
    const [error, setError] = useState('');

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

            // Actualizar el coche con el número de factura/proforma
            await api.updateCar(car.id, { [numberField]: num });
            
            // Actualizar el contador del usuario al siguiente número
            await api.updateProfile({ [fieldToUpdate]: num + 1 });
            
            // Refrescar los datos del usuario en toda la app para obtener el nuevo contador
            await refreshUser();
            
            onConfirm(type, num);
        } catch (err) {
            setError(err.message || 'Error al actualizar los datos.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileInvoice} />
                        Generar {type === 'proforma' ? 'Proforma' : 'Factura'}
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <p className="text-text-secondary text-center">
                        Introduce el número para la {type === 'proforma' ? 'proforma' : 'factura'} o usa el siguiente número disponible.
                    </p>
                    <div>
                        <label htmlFor="pdfNumber" className="block text-sm font-medium text-text-secondary mb-1">
                            Número de {type === 'proforma' ? 'Proforma' : 'Factura'}
                        </label>
                        <input
                            id="pdfNumber"
                            type="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary"
                        />
                    </div>
                     {error && <p className="mt-2 text-sm text-red-accent text-center">{error}</p>}
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end items-center gap-4 p-4 border-t border-border-color">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">CANCELAR</button>
                    <button onClick={handleConfirm} className="bg-blue-accent text-white px-6 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity font-semibold">GENERAR PDF</button>
                </div>
            </div>
        </div>
    );
};

export default GeneratePdfModal;