// autogest-app/frontend/src/components/modals/ReservationPdfModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faDownload, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const ReservationPdfModal = ({ car, onClose }) => {
    if (!car || !car.reservationPdfUrl) return null;

    const handleDownload = async () => {
        try {
            const url = `${API_BASE_URL}${car.reservationPdfUrl}`;
            const filename = url.split('/').pop();
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-xl shadow-2xl w-full max-w-md p-6 text-center border border-border-color">
                <FontAwesomeIcon icon={faCircleCheck} className="w-16 h-16 text-green-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">¡Reserva Confirmada!</h2>
                <p className="text-text-secondary mb-4">
                    Se ha generado el documento de reserva para el <span className="font-semibold text-text-primary">{car.make} {car.model}</span>.
                </p>
                <p className="text-xs text-text-secondary mb-6">
                    Si cierras esta ventana, podrás descargar el documento desde la ficha del coche mientras la reserva esté activa.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto bg-blue-accent text-white px-6 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faDownload} />
                        Descargar PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto bg-component-bg-hover text-text-secondary px-6 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationPdfModal;