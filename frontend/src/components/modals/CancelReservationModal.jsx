// autogest-app/frontend/src/components/modals/CancelReservationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const CancelReservationModal = ({ car, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Confirmar Cancelación</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <p className="text-text-secondary">
                        ¿Estás seguro de que quieres cancelar la reserva del <span className="font-bold text-text-primary">{car.make} {car.model}</span>?
                    </p>
                    <p className="text-sm text-text-secondary mt-2">El coche volverá al estado "En venta".</p>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">
                        No, mantener reserva
                    </button>
                    <button
                        onClick={() => onConfirm(car)}
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 px-4 py-2 rounded-lg shadow-sm hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors font-medium"
                    >
                        Sí, cancelar reserva
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelReservationModal;