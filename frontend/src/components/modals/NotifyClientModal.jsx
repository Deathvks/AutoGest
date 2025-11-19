// autogest-app/frontend/src/components/modals/NotifyClientModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faPhone, faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const InfoItem = ({ icon, label, value }) => (
    <div>
        <label className="flex items-center text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
            <FontAwesomeIcon icon={icon} className="w-3 h-3 mr-2 text-accent" />
            {label}
        </label>
        <p className="font-bold text-gray-900">{value || 'No especificado'}</p>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-300 overflow-hidden flex flex-col">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <h2 className="text-lg font-bold uppercase tracking-wide flex items-center gap-3">
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Avisar al Cliente
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
                    <p className="text-gray-600 text-center font-medium">
                        La documentación del <span className="font-bold text-gray-900">{car.make} {car.model}</span> está lista para ser recogida.
                    </p>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                        <InfoItem icon={faUser} label="Nombre del Cliente" value={`${buyer.name || ''} ${buyer.lastName || ''}`} />
                        <InfoItem icon={faPhone} label="Teléfono" value={buyer.phone} />
                        <InfoItem icon={faEnvelope} label="Email" value={buyer.email} />
                    </div>
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end items-center gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose} 
                        className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cerrar
                    </button>
                    <button 
                        onClick={handleSend} 
                        className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Enviar Aviso
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotifyClientModal;