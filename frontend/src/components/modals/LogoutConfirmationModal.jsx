// autogest-app/frontend/src/components/modals/LogoutConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-xl shadow-2xl w-full max-w-sm border border-border-color">
                <div className="p-6 text-center">
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text-primary">¿CERRAR SESIÓN?</h2>
                    <p className="text-text-secondary mt-2">Estás a punto de salir de tu cuenta. ¿Quieres continuar?</p>
                </div>

                <div className="flex justify-center items-center gap-4 p-4 border-t border-border-color bg-component-bg-hover rounded-b-xl">
                    <button 
                        onClick={onClose}
                        className="w-full bg-component-bg border border-border-color text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold"
                    >
                        CANCELAR
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="w-full bg-accent text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent-hover transition-colors font-semibold"
                    >
                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                        CERRAR SESIÓN
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmationModal;