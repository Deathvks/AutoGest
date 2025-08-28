// autogest-app/frontend/src/components/Toast.jsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faTimes } from '@fortawesome/free-solid-svg-icons';

const Toast = ({ message, onUndo, onClose }) => {
    return (
        <div className="fixed bottom-5 right-5 bg-component-bg text-text-primary py-3 px-5 rounded-lg shadow-lg flex items-center justify-between animate-fade-in-up z-50 border border-border-color">
            <span>{message}</span>
            <div className="flex items-center ml-4">
                <button 
                    onClick={onUndo} 
                    className="font-bold uppercase text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 px-3 py-1 flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faUndo} />
                    Deshacer
                </button>
                <button 
                    onClick={onClose}
                    className="text-text-secondary hover:text-text-primary ml-2 text-xl leading-none"
                    aria-label="Cerrar"
                >
                   <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;