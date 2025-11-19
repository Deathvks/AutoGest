// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsUtils.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faFileLines, faXmark } from '@fortawesome/free-solid-svg-icons';

export const DetailItem = ({ icon, label, value }) => (
    <div className="flex flex-col">
        <div className="flex items-center mb-1">
            <FontAwesomeIcon icon={icon} className="w-3 h-3 mr-2 text-accent" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-sm font-bold text-gray-900 break-words uppercase">{value || 'No especificado'}</p>
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
            <div className="flex items-center mb-1">
                <FontAwesomeIcon icon={icon || faFileLines} className="w-3 h-3 mr-2 text-accent" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            {file && file.path ? (
                <div className="flex items-center justify-between gap-2 group bg-gray-50 px-3 py-2 rounded border border-gray-200 hover:border-blue-300 transition-colors">
                    <button
                        onClick={() => handleDownload(file.path, file.originalname)}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-2 text-left w-full uppercase truncate"
                        title={file.originalname}
                    >
                        <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{file.originalname}</span>
                    </button>
                    {onDeleteFile && (
                        <button
                            onClick={() => onDeleteFile({ car, file, fileType })}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title={`Eliminar ${file.originalname}`}
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                        </button>
                    )}
                </div>
            ) : (
                <p className="text-sm font-bold text-gray-900 uppercase">No hay archivo</p>
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
            <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={icon || faPaperclip} className="w-3 h-3 mr-2 text-accent" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            {files.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 group bg-gray-50 px-3 py-2 rounded border border-gray-200 hover:border-blue-300 transition-colors">
                            <button
                                onClick={() => handleDownload(file.path, file.originalname)}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-2 text-left w-full uppercase truncate"
                                title={file.originalname}
                            >
                                <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{file.originalname}</span>
                            </button>
                            {onDeleteFile && (
                                <button
                                    onClick={() => onDeleteFile({ car, file, fileType })}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                    title={`Eliminar ${file.originalname}`}
                                >
                                    <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm font-bold text-gray-900 uppercase">No hay archivos</p>
            )}
        </div>
    );
};

export const ReservationFileLink = ({ car }) => {
    if (car.status !== 'Reservado' || !car.reservationPdfUrl) {
        return null;
    }

    const file = {
        path: car.reservationPdfUrl,
        originalname: `Reserva_${car.licensePlate}.pdf`
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center mb-1">
                <FontAwesomeIcon icon={faFileLines} className="w-3 h-3 mr-2 text-accent" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Documento de Reserva</span>
            </div>
            <div className="flex items-center justify-between gap-2 group bg-yellow-50 px-3 py-2 rounded border border-yellow-200 hover:border-yellow-400 transition-colors">
                <button
                    onClick={() => handleDownload(file.path, file.originalname)}
                    className="text-xs font-bold text-yellow-700 hover:underline flex items-center gap-2 text-left w-full uppercase truncate"
                    title={file.originalname}
                >
                    <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{file.originalname}</span>
                </button>
            </div>
        </div>
    );
};