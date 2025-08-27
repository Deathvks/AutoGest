// autogest-app/frontend/src/components/modals/DeleteAccountConfirmationModal.jsx
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';

const DeleteAccountConfirmationModal = ({ onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { deleteAccount } = useContext(AuthContext);

    const handleConfirm = async () => {
        setError('');
        if (!password) {
            setError('Debes introducir tu contraseña para confirmar.');
            return;
        }

        try {
            await deleteAccount();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al eliminar la cuenta.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Eliminar Cuenta Permanentemente</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-red-accent mx-auto mb-4" />
                    <p className="text-text-secondary">
                        Esta acción es irreversible. Todos tus datos, incluyendo coches, gastos e incidencias, serán eliminados para siempre.
                    </p>
                    <p className="text-sm text-text-secondary mt-2">
                        Para confirmar, por favor, introduce tu contraseña.
                    </p>
                </div>
                <div className="mt-6">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Contraseña</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-red-accent focus:border-red-accent text-text-primary"
                    />
                    {error && <p className="mt-2 text-sm text-red-accent">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-red-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Sí, eliminar mi cuenta</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountConfirmationModal;