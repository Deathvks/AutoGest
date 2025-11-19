// autogest-app/frontend/src/components/modals/AddIncidentModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const AddIncidentModal = ({ car, onClose, onConfirm }) => {
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [description]);

    const handleConfirm = () => {
        setError('');
        if (!description.trim()) {
            setError("La descripción no puede estar vacía.");
            return;
        }
        onConfirm(car, description);
    };

    if (!car) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col border border-gray-300 overflow-hidden">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Añadir Incidencia</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar bg-white">
                    <div className="text-center mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-sm uppercase font-medium">
                            Incidencia para: <span className="font-bold text-gray-900">{car.make} {car.model} ({car.licensePlate})</span>
                        </p>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1 uppercase">Descripción</label>
                        <textarea
                            ref={textareaRef}
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe el problema o la incidencia reportada..."
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 resize-none overflow-hidden transition-colors"
                            rows="3"
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
                        Añadir Incidencia
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddIncidentModal;