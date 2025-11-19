// autogest-app/frontend/src/components/modals/LogoutConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-300 overflow-hidden">
                <div className="p-8 text-center bg-white">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
                        <FontAwesomeIcon icon={faSignOutAlt} className="text-3xl text-accent" />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">¿Cerrar Sesión?</h2>
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed font-medium">
                        Estás a punto de salir de tu cuenta. ¿Quieres continuar?
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
                        onClick={onConfirm}
                        className="w-full bg-accent text-white px-4 py-2.5 rounded-lg shadow hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide"
                    >
                        Sí, Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmationModal;