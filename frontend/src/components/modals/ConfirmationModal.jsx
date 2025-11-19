// frontend/src/components/modals/ConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

/**
 * Un modal de confirmación genérico.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Si el modal está abierto.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onConfirm - Función a ejecutar al confirmar.
 * @param {string} props.title - El título del modal.
 * @param {string} props.message - El mensaje de cuerpo del modal.
 * @param {string} [props.confirmText='Confirmar'] - Texto del botón de confirmación.
 * @param {string} [props.cancelText='Cancelar'] - Texto del botón de cancelación.
 * @param {object} [props.icon=faExclamationTriangle] - Icono de FontAwesome a mostrar.
 * @param {string} [props.iconColor='text-yellow-600'] - Clase de color para el icono.
 */
const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar', 
    icon = faExclamationTriangle, 
    iconColor = 'text-yellow-600' 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 animate-fade-in-up backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-300 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center bg-white">
                    <div className={`w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100`}>
                         <FontAwesomeIcon icon={icon} className={`text-3xl ${iconColor}`} />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">{title}</h2>
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed font-medium">
                        {message}
                    </p>
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose}
                        className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="w-full bg-accent text-white px-4 py-2.5 rounded-lg shadow-lg hover:bg-accent-hover transition-opacity font-bold uppercase text-xs tracking-wide"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;