// autogest-app/frontend/src/components/modals/DeleteExpenseConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const DeleteExpenseConfirmationModal = ({ expense, onClose, onConfirm }) => {
    if (!expense) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Confirmar Eliminación</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                        ¿Estás seguro de que quieres eliminar este gasto de <span className="font-bold text-slate-800 dark:text-slate-200">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</span>?
                    </p>
                    <p className="text-sm text-slate-500 mt-2">Esta acción no se puede deshacer.</p>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                    <button onClick={() => onConfirm(expense.id)} className="bg-rose-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-rose-700 transition-colors">Eliminar Gasto</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteExpenseConfirmationModal;