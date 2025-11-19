// autogest-app/frontend/src/components/modals/DeleteUserConfirmationModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const DeleteUserConfirmationModal = ({ user, onClose, onConfirmDelete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!user) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        setError('');
        try {
            await onConfirmDelete(user.id);
        } catch (err) {
            setError(err.message || 'Error al eliminar. Es posible que el usuario tenga datos asociados y no pueda ser borrado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-300 overflow-hidden">
                <div className="p-8 text-center bg-white">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-600" />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">¿Eliminar Usuario?</h2>
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed font-medium">
                        Estás a punto de eliminar permanentemente al usuario <span className="font-bold text-gray-900">{user.name}</span>.
                    </p>

                    {user.isOwner && (
                        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-left rounded-r-lg text-xs">
                            <p className="font-bold uppercase mb-1">¡Atención!</p>
                            <p>
                                Este usuario es el propietario de un equipo. Al eliminarlo, el equipo se disolverá y todos sus miembros serán desvinculados.
                            </p>
                        </div>
                    )}

                    <p className="text-xs text-red-500 font-bold mt-4 uppercase tracking-wide">
                        Esta acción es irreversible.
                    </p>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-xs font-bold uppercase rounded-r text-left">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg shadow hover:bg-red-700 transition-colors font-bold uppercase text-xs tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Sí, Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserConfirmationModal;