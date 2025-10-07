import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// --- INICIO DE LA MODIFICACIÓN ---
const DeleteIncidentConfirmationModal = ({ incident, onClose, onConfirm }) => {
    if (!incident) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg/80 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-red-accent mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-text-primary">¿Eliminar Incidencia?</h2>
                    <p className="text-text-secondary mt-2">
                        Estás a punto de eliminar permanentemente la incidencia:
                    </p>
                    <p className="mt-2 text-sm font-semibold text-text-primary bg-background/50 p-2 rounded-lg border border-border-color">
                        "{incident.description}"
                    </p>
                    <p className="text-sm text-yellow-accent mt-4">
                        Esta acción es irreversible.
                    </p>
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover/50 rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="w-full bg-component-bg border border-border-color text-text-primary px-4 py-2.5 rounded-lg hover:bg-border-color transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => onConfirm(incident.id)}
                        className="w-full bg-red-accent text-white px-4 py-2.5 rounded-lg shadow-lg shadow-red-accent/20 hover:opacity-90 transition-opacity font-semibold"
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- FIN DE LA MODIFICACIÓN ---

export default DeleteIncidentConfirmationModal;