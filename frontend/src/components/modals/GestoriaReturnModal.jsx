// autogest-app/frontend/src/components/modals/GestoriaReturnModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

const GestoriaReturnModal = ({ car, onClose, onConfirm }) => {
    const [returnDate, setReturnDate] = useState(car.gestoriaReturnDate || new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!returnDate) {
            setError('Debes seleccionar una fecha.');
            return;
        }
        onConfirm(car, returnDate);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Entrega de Documentación</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-left mb-6">
                    <p className="text-text-secondary">
                        {car.gestoriaReturnDate ? 'Edita la fecha' : 'Registra la fecha'} en la que la gestoría te devolvió los documentos del <span className="font-bold text-text-primary">{car.make} {car.model}</span>.
                    </p>
                </div>
                <div>
                    <label htmlFor="returnDate" className="block text-sm font-medium text-text-secondary mb-1">Fecha de Entrega</label>
                    <div className="relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4 text-text-secondary" />
                        </div>
                        <input
                            type="date"
                            id="returnDate"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            className="w-full pl-10 px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary"
                        />
                    </div>
                    {error && <p className="mt-2 text-sm text-red-accent">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                        {car.gestoriaReturnDate ? 'Guardar Cambios' : 'Confirmar Entrega'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GestoriaReturnModal;