// autogest-app/frontend/src/components/modals/InsuranceConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

const InsuranceConfirmationModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Confirmación Requerida</h2>
                    <button onClick={onCancel} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-yellow-accent mx-auto mb-4" />
                    <p className="text-text-secondary">
                        Este coche no tiene seguro. ¿Desea continuar de todos modos?
                    </p>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onCancel} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={onConfirm} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Sí, continuar</button>
                </div>
            </div>
        </div>
    );
};

export default InsuranceConfirmationModal;