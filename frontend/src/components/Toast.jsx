// autogest-app/frontend/src/components/Toast.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faTimes } from '@fortawesome/free-solid-svg-icons';

const Toast = ({ message, onUndo, onClose }) => {
    return (
        <div className="fixed bottom-5 right-5 bg-component-bg/80 backdrop-blur-lg text-text-primary p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-fade-in-up z-50 border border-border-color max-w-sm">
            <span className="font-medium text-sm">{message}</span>
            <div className="flex items-center ml-4 gap-2">
                <button 
                    onClick={onUndo} 
                    className="font-semibold uppercase text-yellow-accent bg-yellow-accent/10 hover:bg-yellow-accent/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-colors"
                >
                    <FontAwesomeIcon icon={faUndo} />
                    Deshacer
                </button>
                <button 
                    onClick={onClose}
                    className="text-text-secondary hover:text-text-primary w-7 h-7 flex items-center justify-center rounded-full hover:bg-component-bg-hover transition-colors"
                    aria-label="Cerrar"
                >
                   <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
