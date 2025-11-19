// autogest-app/frontend/src/components/modals/DeleteExpenseConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const DeleteExpenseConfirmationModal = ({ expense, onClose, onConfirm }) => {
    if (!expense) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-300 overflow-hidden">
                <div className="p-8 text-center bg-white">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-600" />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">¿Eliminar Gasto?</h2>
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed font-medium">
                        Estás a punto de eliminar permanentemente este gasto.
                    </p>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                         <p className="font-extrabold text-gray-900 text-3xl">
                             {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}
                         </p>
                         {expense.description && (
                             <p className="text-sm text-gray-500 mt-1 italic truncate px-2" title={expense.description}>
                                 "{expense.description}"
                             </p>
                         )}
                    </div>
                    
                    <p className="text-xs text-red-500 font-bold mt-6 uppercase tracking-wide">
                        Esta acción es irreversible.
                    </p>
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose}
                        className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => onConfirm(expense.id)}
                        className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg shadow hover:bg-red-700 transition-colors font-bold uppercase text-xs tracking-wide"
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteExpenseConfirmationModal;