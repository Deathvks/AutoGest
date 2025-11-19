// autogest-app/frontend/src/components/modals/InsuranceConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const InsuranceConfirmationModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-300 overflow-hidden">
                <div className="p-8 text-center bg-white">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-yellow-50 border border-yellow-100">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-yellow-600" />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">Confirmación Requerida</h2>
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed font-medium">
                        Este coche no tiene seguro. ¿Deseas continuar de todos modos?
                    </p>
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onCancel}
                        className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow hover:bg-blue-700 transition-colors font-bold uppercase text-xs tracking-wide"
                    >
                        Sí, continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsuranceConfirmationModal;