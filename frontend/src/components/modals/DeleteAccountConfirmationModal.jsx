// autogest-app/frontend/src/components/modals/DeleteAccountConfirmationModal.jsx
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faKey } from '@fortawesome/free-solid-svg-icons';
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
            await deleteAccount(password);
            onClose();
        } catch (err) {
            setError(err.message || 'Error al eliminar la cuenta. Contraseña incorrecta.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-300 overflow-hidden">
                <div className="p-8 text-center bg-white">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-600" />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">¿Eliminar tu Cuenta?</h2>
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed font-medium">
                        Esta acción es irreversible y borrará todos tus datos. Para confirmar, por favor, introduce tu contraseña.
                    </p>
                </div>

                <div className="px-8 pb-6 bg-white">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <FontAwesomeIcon icon={faKey} className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Introduce tu contraseña"
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 placeholder:text-gray-400 transition-colors shadow-sm"
                        />
                    </div>
                    {error && (
                        <div className="mt-3 p-2 bg-red-50 border-l-4 border-red-600 text-red-700 text-xs font-bold uppercase rounded-r text-center">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose}
                        className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg shadow hover:bg-red-700 transition-colors font-bold uppercase text-xs tracking-wide whitespace-nowrap"
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountConfirmationModal;