// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsUtils.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faFileLines, faXmark } from '@fortawesome/free-solid-svg-icons';

export const DetailItem = ({ icon, label, value }) => (
    <div className="flex flex-col">
        <div className="flex items-center text-sm text-text-secondary mb-1 uppercase">
            <FontAwesomeIcon icon={icon} className="w-4 h-4 mr-3 text-accent" />
            <span className="font-semibold">{label}</span>
        </div>
        <p className="font-bold text-text-primary break-words uppercase">{value || 'No especificado'}</p>
    </div>
);

const handleDownload = async (url, filename) => {
    try {
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
        console.error("Error al descargar el archivo:", error);
    }
};

export const SingleFileLink = ({ label, icon, fileData, car, fileType, onDeleteFile }) => {
    let file = null;
    if (fileData) {
        try {
            file = typeof fileData === 'string' ? JSON.parse(fileData) : fileData;
        } catch (e) {
            console.error("Error parsing single file data:", e);
        }
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center text-sm text-text-secondary mb-1 uppercase">
                <FontAwesomeIcon icon={icon || faFileLines} className="w-4 h-4 mr-3 text-accent" />
                <span className="font-semibold">{label}</span>
            </div>
            {file && file.path ? (
                <div className="flex items-center justify-between gap-2 group">
                    <button
                        onClick={() => handleDownload(file.path, file.originalname)}
                        className="text-sm font-bold text-blue-accent hover:underline flex items-center gap-2 text-left w-full uppercase"
                        title={file.originalname}
                    >
                        <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{file.originalname}</span>
                    </button>
                    {onDeleteFile && (
                        <button
                            onClick={() => onDeleteFile({ car, file, fileType })}
                            className="text-red-accent/50 hover:text-red-accent opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title={`Eliminar ${file.originalname}`}
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                        </button>
                    )}
                </div>
            ) : (
                <p className="font-bold text-text-primary uppercase">No hay archivo</p>
            )}
        </div>
    );
};

export const MultiFileLinks = ({ label, icon, filesData, car, fileType, onDeleteFile }) => {
    let files = [];
    if (filesData) {
        try {
            files = typeof filesData === 'string' ? JSON.parse(filesData) : filesData;
            if (!Array.isArray(files)) files = [];
        } catch (e) {
            files = [];
        }
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center text-sm text-text-secondary mb-1 uppercase">
                <FontAwesomeIcon icon={icon || faPaperclip} className="w-4 h-4 mr-3 text-accent" />
                <span className="font-semibold">{label}</span>
            </div>
            {files.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 group">
                            <button
                                onClick={() => handleDownload(file.path, file.originalname)}
                                className="text-sm font-bold text-blue-accent hover:underline flex items-center gap-2 text-left w-full uppercase"
                                title={file.originalname}
                            >
                                <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{file.originalname}</span>
                            </button>
                            {onDeleteFile && (
                                <button
                                    onClick={() => onDeleteFile({ car, file, fileType })}
                                    className="text-red-accent/50 hover:text-red-accent opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    title={`Eliminar ${file.originalname}`}
                                >
                                    <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="font-bold text-text-primary uppercase">No hay archivos</p>
            )}
        </div>
    );
};

// --- INICIO DE LA MODIFICACIÓN ---
export const ReservationFileLink = ({ car }) => {
    // Solo muestra este componente si el coche está reservado y tiene un PDF de reserva.
    if (car.status !== 'Reservado' || !car.reservationPdfUrl) {
        return null;
    }

    const file = {
        path: car.reservationPdfUrl,
        originalname: `Reserva_${car.licensePlate}.pdf`
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center text-sm text-text-secondary mb-1 uppercase">
                <FontAwesomeIcon icon={faFileLines} className="w-4 h-4 mr-3 text-accent" />
                <span className="font-semibold">Documento de Reserva</span>
            </div>
            <div className="flex items-center justify-between gap-2 group">
                <button
                    onClick={() => handleDownload(file.path, file.originalname)}
                    className="text-sm font-bold text-blue-accent hover:underline flex items-center gap-2 text-left w-full uppercase"
                    title={file.originalname}
                >
                    <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{file.originalname}</span>
                </button>
            </div>
        </div>
    );
};
// --- FIN DE LA MODIFICACIÓN ---