// autogest-app/frontend/src/components/modals/DeleteUserConfirmationModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';

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
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-red-accent mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-text-primary">¿Eliminar Usuario?</h2>
                    <p className="text-text-secondary mt-2">
                        Estás a punto de eliminar permanentemente al usuario <span className="font-semibold text-text-primary">{user.name}</span>.
                    </p>
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    {user.isOwner && (
                        <p className="text-sm text-yellow-accent mt-4 bg-yellow-accent/10 p-3 rounded-lg border border-yellow-accent/20">
                            <strong>¡Atención!</strong> Este usuario es el propietario de un equipo. Al eliminarlo, el equipo se disolverá y todos sus miembros serán desvinculados.
                        </p>
                    )}
                    <p className="text-sm text-yellow-accent mt-4">
                        Esta acción es irreversible.
                    </p>
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                    {error && (
                        <p className="mt-4 text-sm text-red-accent bg-red-accent/10 p-3 rounded-lg border border-red-accent/20">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full bg-component-bg border border-border-color text-text-primary px-4 py-2.5 rounded-lg hover:bg-border-color transition-colors font-semibold disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full bg-red-accent/10 text-red-accent px-4 py-2.5 rounded-lg hover:bg-red-accent/20 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Sí, Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserConfirmationModal;