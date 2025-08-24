import React from 'react';

// --- Iconos ---
const XIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const AlertTriangleIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);

// --- Componente Principal del Modal ---
const DeleteCarConfirmationModal = ({ car, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Confirmar Eliminación</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center">
                    <AlertTriangleIcon className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                        ¿Estás seguro de que quieres eliminar el <span className="font-bold text-slate-800 dark:text-slate-200">{car.make} {car.model}</span>?
                    </p>
                    <p className="text-sm text-slate-500 mt-2">Esta acción no se puede deshacer.</p>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                    <button onClick={() => onConfirm(car.id)} className="bg-rose-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-rose-700 transition-colors">Eliminar Coche</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCarConfirmationModal;