// autogest-app/frontend/src/components/modals/GestoriaReturnModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import DatePicker from '../DatePicker';

const GestoriaReturnModal = ({ car, onClose, onConfirm }) => {
    const [returnDate, setReturnDate] = useState(car.gestoriaReturnDate ? new Date(car.gestoriaReturnDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!returnDate) {
            setError('Debes seleccionar una fecha.');
            return;
        }
        onConfirm(car, returnDate);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col border border-gray-300 overflow-hidden">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faCalendarCheck} className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Entrega de Documentación</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
                    <p className="text-gray-600 text-center font-medium">
                        {car.gestoriaReturnDate ? 'Edita la fecha' : 'Registra la fecha'} en la que la gestoría te devolvió los documentos del <span className="font-bold text-gray-900">{car.make} {car.model}</span>.
                    </p>
                    <div>
                        <DatePicker
                            label="Fecha de Entrega"
                            value={returnDate}
                            onChange={setReturnDate}
                            icon={faCalendarCheck}
                        />
                        {error && (
                            <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold uppercase rounded-r">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50">
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
                        {car.gestoriaReturnDate ? 'Guardar Cambios' : 'Confirmar Entrega'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GestoriaReturnModal;