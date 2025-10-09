// autogest-app/frontend/src/components/modals/InsuranceConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

const InsuranceConfirmationModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-yellow-accent mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-text-primary">Confirmación Requerida</h2>
                    <p className="text-text-secondary mt-2">
                        Este coche no tiene seguro. ¿Deseas continuar de todos modos?
                    </p>
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    <button 
                        onClick={onCancel}
                        className="w-full bg-component-bg border border-border-color text-text-primary px-4 py-2.5 rounded-lg hover:bg-border-color transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="w-full bg-blue-accent text-white px-4 py-2.5 rounded-lg shadow-lg shadow-blue-accent/20 hover:opacity-90 transition-opacity font-semibold"
                    >
                        Sí, continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsuranceConfirmationModal;