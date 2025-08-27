// autogest-app/frontend/src/components/modals/AddIncidentModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

// --- Componente de Formulario Reutilizable ---
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
            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
            <textarea ref={textareaRef} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-yellow-accent focus:border-yellow-accent text-text-primary resize-none overflow-hidden" rows="3" />
        </div>
    );
};

// --- Componente Principal del Modal ---
const AddIncidentModal = ({ car, onClose, onConfirm }) => {
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        setError('');
        if (!description.trim()) {
            setError("La descripción no puede estar vacía.");
            return;
        }
        onConfirm(car, description);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Añadir Incidencia</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="text-left">
                        <p className="text-text-secondary">
                            Añadiendo incidencia para el <span className="font-bold text-text-primary">{car.make} {car.model}</span> con matrícula <span className="font-bold text-text-primary">{car.licensePlate}</span>.
                        </p>
                    </div>
                    <div className="mt-6">
                        <TextareaField 
                            label="Descripción de la Incidencia"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe el problema o la incidencia reportada..."
                        />
                    </div>

                    {error && <p className="mt-4 text-sm text-red-accent">{error}</p>}
                </form>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-yellow-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Confirmar Incidencia</button>
                </div>
            </div>
        </div>
    );
};

export default AddIncidentModal;