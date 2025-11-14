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
 * @param {string} [props.iconColor='text-yellow-accent'] - Clase de color para el icono.
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
    iconColor = 'text-yellow-accent' 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in-up" onClick={onClose}>
            <div 
                className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={icon} className={`w-16 h-16 ${iconColor} mx-auto mb-6`} />
                    <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                    <p className="text-text-secondary mt-2">
                        {message}
                    </p>
                </div>
                <div className="flex justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="w-full bg-component-bg border border-border-color text-text-primary px-4 py-2.5 rounded-lg hover:bg-border-color transition-colors font-semibold"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="w-full bg-accent text-white px-4 py-2.5 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;