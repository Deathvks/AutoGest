// autogest-app/frontend/src/components/modals/ReservationPdfModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCircleCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const ReservationPdfModal = ({ car, onClose }) => {
    if (!car || !car.reservationPdfUrl) return null;

    const handleDownload = async () => {
        try {
            const url = `${API_BASE_URL}${car.reservationPdfUrl}`;
            const filename = `Reserva_${car.licensePlate}.pdf`;
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Error al descargar el PDF de reserva:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-300 overflow-hidden flex flex-col">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <h2 className="text-lg font-bold uppercase tracking-wide flex items-center gap-3">
                        <FontAwesomeIcon icon={faCircleCheck} />
                        Reserva Confirmada
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 text-center bg-white flex-grow">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-100">
                        <FontAwesomeIcon icon={faCircleCheck} className="w-10 h-10 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">
                        ¡Todo listo!
                    </h2>
                    <p className="text-gray-600 text-base mb-2">
                        Se ha generado el documento de reserva para el <span className="font-bold text-gray-900 uppercase">{car.make} {car.model}</span>.
                    </p>
                    <p className="text-xs text-gray-500 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        Podrás descargar este documento desde la ficha del coche mientras la reserva esté activa.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faDownload} />
                        Descargar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationPdfModal;