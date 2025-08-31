// autogest-app/frontend/src/components/modals/CancelReservationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const CancelReservationModal = ({ car, onClose, onConfirm }) => {
    if (!car) return null;

    const handleConfirm = () => {
        onConfirm(car);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-component-bg rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary">Confirmar Cancelación</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-accent text-5xl mb-4" />
                    <p className="text-text-primary text-lg mb-2">
                        ¿Estás seguro de que quieres cancelar la reserva del <span className="font-semibold">{car.make} {car.model}</span>?
                    </p>
                    <p className="text-text-secondary text-sm">
                        El coche volverá al estado "En venta".
                    </p>
                </div>
                <div className="p-4 border-t border-border-color flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold text-text-secondary bg-component-bg-hover rounded-lg border border-border-color hover:bg-border-color transition-colors"
                    >
                        No, mantener reserva
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-5 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover transition-colors"
                    >
                        Sí, cancelar reserva
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelReservationModal;