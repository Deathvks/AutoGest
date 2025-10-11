// autogest-app/frontend/src/components/modals/ReservationPdfModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const ReservationPdfModal = ({ car, onClose }) => {
    if (!car || !car.reservationPdfUrl) return null;

    const handleDownload = async () => {
        try {
            const url = `${API_BASE_URL}${car.reservationPdfUrl}`;
            // --- INICIO DE LA MODIFICACIÓN ---
            const filename = `Reserva_${car.licensePlate}.pdf`;
            // --- FIN DE LA MODIFICACIÓN ---
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
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-border-color">
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={faCircleCheck} className="w-16 h-16 text-green-accent mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-text-primary">¡Reserva Confirmada!</h2>
                    <p className="text-text-secondary mt-2">
                        Se ha generado el documento de reserva para el <span className="font-semibold text-text-primary">{car.make} {car.model}</span>.
                    </p>
                    <p className="text-xs text-text-secondary mt-4">
                        Podrás descargar este documento desde la ficha del coche mientras la reserva esté activa.
                    </p>
                </div>

                <div className="flex justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full bg-component-bg border border-border-color text-text-primary px-4 py-2.5 rounded-lg hover:bg-border-color transition-colors font-semibold"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={handleDownload}
                        className="w-full bg-blue-accent text-white px-4 py-2.5 rounded-lg shadow-lg shadow-blue-accent/20 hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2"
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