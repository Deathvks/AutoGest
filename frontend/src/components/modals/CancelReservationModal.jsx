import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const CancelReservationModal = ({ car, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Confirmar Cancelación</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                        ¿Estás seguro de que quieres cancelar la reserva del <span className="font-bold text-slate-800 dark:text-slate-200">{car.make} {car.model}</span>?
                    </p>
                    <p className="text-sm text-slate-500 mt-2">El coche volverá al estado "En venta".</p>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        No, mantener reserva
                    </button>
                    <button
                        onClick={() => onConfirm(car)}
                        className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-amber-600 transition-colors"
                    >
                        Sí, cancelar reserva
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelReservationModal;