// autogest-app/frontend/src/components/modals/NotifyClientModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faPhone, faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const InfoItem = ({ icon, label, value }) => (
    <div>
        <label className="flex items-center text-xs text-text-secondary">
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
        return null; // No mostrar el modal si los datos están corruptos
    }

    const handleSend = () => {
        // Por ahora, solo cierra el modal
        console.log("Aviso enviado (simulación)");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Avisar al Cliente</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-left mb-6">
                    <p className="text-text-secondary">
                        La documentación del <span className="font-bold text-text-primary">{car.make} {car.model}</span> está lista para ser recogida.
                    </p>
                </div>
                <div className="p-4 bg-background rounded-lg space-y-4 border border-border-color">
                    <InfoItem icon={faUser} label="Nombre del Cliente" value={`${buyer.name || ''} ${buyer.lastName || ''}`} />
                    <InfoItem icon={faPhone} label="Teléfono" value={buyer.phone} />
                    <InfoItem icon={faEnvelope} label="Email" value={buyer.email} />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cerrar</button>
                    <button onClick={handleSend} className="bg-green-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Enviar Aviso
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotifyClientModal;