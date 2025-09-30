// autogest-app/frontend/src/components/modals/ExpelUserConfirmationModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUserSlash } from '@fortawesome/free-solid-svg-icons';

const ExpelUserConfirmationModal = ({ user, onClose, onConfirmExpel }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Confirmar Expulsión</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center">
                    <FontAwesomeIcon icon={faUserSlash} className="w-16 h-16 text-red-accent mx-auto mb-4" />
                    <p className="text-text-secondary">
                        ¿Estás seguro de que quieres expulsar a <span className="font-bold text-text-primary">{user.name}</span> del equipo?
                    </p>
                    <p className="text-sm text-text-secondary mt-2">
                        El usuario perderá el acceso a los datos del equipo y su rol será restablecido a "Usuario".
                    </p>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={() => onConfirmExpel(user.id)} className="bg-red-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Expulsar Usuario</button>
                </div>
            </div>
        </div>
    );
};

export default ExpelUserConfirmationModal;