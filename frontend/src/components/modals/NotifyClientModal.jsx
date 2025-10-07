// autogest-app/frontend/src/components/modals/NotifyClientModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faPhone, faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const InfoItem = ({ icon, label, value }) => (
    <div>
        <label className="flex items-center text-xs text-text-secondary uppercase">
            <FontAwesomeIcon icon={icon} className="w-3 h-3 mr-2" />
            {label}
        </label>
        <p className="font-semibold text-text-primary">{value || 'No especificado'}</p>
    </div>
);

const NotifyClientModal = ({ car, onClose }) => {
    if (!car || !car.buyerDetails) return null;

    let buyer = {};
    try {
        buyer = typeof car.buyerDetails === 'string' ? JSON.parse(car.buyerDetails) : car.buyerDetails;
    } catch (e) {
        console.error("Error parsing buyer details:", e);
        return null;
    }

    const handleSend = () => {
        console.log("Aviso enviado (simulación)");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg/80 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Avisar al Cliente
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <p className="text-text-secondary text-center">
                        La documentación del <span className="font-bold text-text-primary">{car.make} {car.model}</span> está lista para ser recogida.
                    </p>
                    <div className="p-4 bg-background/50 rounded-xl space-y-4 border border-border-color">
                        <InfoItem icon={faUser} label="Nombre del Cliente" value={`${buyer.name || ''} ${buyer.lastName || ''}`} />
                        <InfoItem icon={faPhone} label="Teléfono" value={buyer.phone} />
                        <InfoItem icon={faEnvelope} label="Email" value={buyer.email} />
                    </div>
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end items-center gap-4 p-4 border-t border-border-color bg-component-bg-hover/50 rounded-b-2xl">
                    <button onClick={onClose} className="bg-component-bg border border-border-color text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold uppercase">Cerrar</button>
                    <button onClick={handleSend} className="bg-green-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-green-accent/20 hover:opacity-90 transition-opacity font-semibold flex items-center gap-2 uppercase">
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Enviar Aviso
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotifyClientModal;