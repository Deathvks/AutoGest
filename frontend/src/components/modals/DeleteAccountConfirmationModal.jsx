// autogest-app/frontend/src/components/modals/DeleteAccountConfirmationModal.jsx
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExclamationTriangle, faKey } from '@fortawesome/free-solid-svg-icons';
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
            // Se asume que deleteAccount ahora podría necesitar la contraseña
            // Si no, esta lógica se puede ajustar. Por ahora, se pasa como argumento.
            await deleteAccount(password);
            onClose();
        } catch (err) {
            setError(err.message || 'Error al eliminar la cuenta. Contraseña incorrecta.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-red-accent mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-text-primary">¿Eliminar tu Cuenta?</h2>
                    <p className="text-text-secondary mt-2">
                        Esta acción es irreversible y borrará todos tus datos. Para confirmar, por favor, introduce tu contraseña.
                    </p>
                </div>

                <div className="px-8 pb-6">
                    <div className="relative">
                        <FontAwesomeIcon icon={faKey} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Introduce tu contraseña"
                            className="w-full pl-11 pr-4 py-2 bg-component-bg-hover border rounded-lg focus:ring-1 focus:ring-red-accent text-text-primary transition-colors border-border-color focus:border-red-accent placeholder:text-text-secondary"
                        />
                    </div>
                    {error && <p className="mt-2 text-sm text-red-accent text-center font-semibold">{error}</p>}
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="w-full bg-component-bg border border-border-color text-text-primary px-4 py-2.5 rounded-lg hover:bg-border-color transition-colors font-semibold whitespace-nowrap"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="w-full bg-red-accent/10 text-red-accent px-4 py-2.5 rounded-lg hover:bg-red-accent/20 transition-colors font-semibold whitespace-nowrap"
                    >
                        Sí, Eliminar Mi Cuenta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountConfirmationModal;