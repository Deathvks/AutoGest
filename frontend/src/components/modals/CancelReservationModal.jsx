// autogest-app/frontend/src/components/modals/CancelReservationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// --- INICIO DE LA MODIFICACIÓN ---
const CancelReservationModal = ({ car, onClose, onConfirm }) => {
    if (!car) return null;

    const handleConfirm = () => {
        onConfirm(car);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-accent text-5xl mb-6" />
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                        ¿Cancelar Reserva?
                    </h2>
                    <p className="text-text-secondary">
                        El <span className="font-semibold text-text-primary">{car.make} {car.model}</span> volverá al estado "En venta".
                    </p>
                </div>
                <div className="p-6 border-t border-border-color flex justify-end gap-4 bg-component-bg-hover/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold text-text-primary bg-component-bg rounded-lg border border-border-color hover:bg-border-color transition-colors"
                    >
                        No, mantener
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-5 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-colors"
                    >
                        Sí, cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- FIN DE LA MODIFICACIÓN ---

export default CancelReservationModal;