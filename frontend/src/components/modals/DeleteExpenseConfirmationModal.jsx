// autogest-app/frontend/src/components/modals/DeleteExpenseConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const DeleteExpenseConfirmationModal = ({ expense, onClose, onConfirm }) => {
    if (!expense) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Confirmar Eliminación</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-red-accent mx-auto mb-4" />
                    <p className="text-text-secondary">
                        ¿Estás seguro de que quieres eliminar este gasto de <span className="font-bold text-text-primary">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</span>?
                    </p>
                    <p className="text-sm text-text-secondary mt-2">Esta acción no se puede deshacer.</p>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={() => onConfirm(expense.id)} className="bg-red-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Eliminar Gasto</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteExpenseConfirmationModal;