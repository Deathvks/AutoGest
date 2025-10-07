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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg/80 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
                        <FontAwesomeIcon icon={faCalendarCheck} />
                        Entrega de Documentación
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <p className="text-text-secondary text-center">
                        {car.gestoriaReturnDate ? 'Edita la fecha' : 'Registra la fecha'} en la que la gestoría te devolvió los documentos del <span className="font-bold text-text-primary">{car.make} {car.model}</span>.
                    </p>
                    <div>
                        <label htmlFor="returnDate" className="block text-sm font-semibold text-text-primary mb-1 uppercase">Fecha de Entrega</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4 text-text-secondary" />
                            </div>
                            <input
                                type="date"
                                id="returnDate"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full pl-11 px-4 py-2 bg-background/50 border rounded-lg focus:ring-1 focus:border-accent text-text-primary transition-colors border-border-color focus:ring-accent"
                            />
                        </div>
                        {error && <p className="mt-2 text-sm text-red-accent text-center font-semibold uppercase">{error}</p>}
                    </div>
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end items-center gap-4 p-4 border-t border-border-color bg-component-bg-hover/50 rounded-b-2xl">
                    <button onClick={onClose} className="bg-component-bg border border-border-color text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold uppercase">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold uppercase">
                        {car.gestoriaReturnDate ? 'Guardar Cambios' : 'Confirmar Entrega'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GestoriaReturnModal;