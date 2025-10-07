// autogest-app/frontend/src/components/modals/LogoutConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-16 h-16 text-accent mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-text-primary">¿Cerrar Sesión?</h2>
                    <p className="text-text-secondary mt-2">
                        Estás a punto de salir de tu cuenta. ¿Quieres continuar?
                    </p>
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="w-full bg-component-bg border border-border-color text-text-primary px-4 py-2.5 rounded-lg hover:bg-border-color transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="w-full bg-accent text-white px-4 py-2.5 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold"
                    >
                        Sí, Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmationModal;