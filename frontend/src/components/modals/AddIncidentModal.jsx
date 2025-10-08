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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        Añadir Incidencia
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <p className="text-text-secondary text-center">
                        Añadiendo incidencia para el <span className="font-bold text-text-primary">{car.make} {car.model}</span> ({car.licensePlate}).
                    </p>
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-text-primary mb-1 uppercase">Descripción</label>
                        <textarea
                            ref={textareaRef}
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe el problema o la incidencia reportada..."
                            className="w-full px-4 py-2 bg-background/50 border rounded-lg focus:ring-1 focus:border-accent text-text-primary transition-colors border-border-color focus:ring-accent resize-none overflow-hidden"
                            rows="3"
                        />
                        {error && <p className="mt-2 text-sm text-red-accent text-center font-semibold uppercase">{error}</p>}
                    </div>
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end items-center gap-4 p-4 border-t border-border-color bg-component-bg-hover/50 rounded-b-2xl">
                    <button onClick={onClose} className="bg-component-bg border border-border-color text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold uppercase">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold uppercase">Añadir Incidencia</button>
                </div>
            </div>
        </div>
    );
};

export default AddIncidentModal;