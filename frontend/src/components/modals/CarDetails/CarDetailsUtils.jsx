// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsUtils.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faFileLines, faXmark } from '@fortawesome/free-solid-svg-icons';

export const DetailItem = ({ icon, label, value }) => (
    <div className="flex flex-col">
        <div className="flex items-center mb-1.5">
            <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 mr-2 text-[#6B7280]" />
            <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-[15px] font-bold text-[#06122A] break-words uppercase">{value || 'No especificado'}</p>
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
            <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={icon || faFileLines} className="w-3.5 h-3.5 mr-2 text-[#6B7280]" />
                <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">{label}</span>
            </div>
            {file && file.path ? (
                <div className="flex items-center justify-between gap-2 group bg-[#F2F4F8] px-4 py-2.5 rounded-[10px] border border-[#E5E7EB] hover:border-[#1E3A8A]/30 transition-colors">
                    <button
                        onClick={() => handleDownload(file.path, file.originalname)}
                        className="text-[13px] font-bold text-[#1E3A8A] hover:underline flex items-center gap-2 text-left w-full uppercase truncate"
                        title={file.originalname}
                    >
                        <FontAwesomeIcon icon={faPaperclip} className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{file.originalname}</span>
                    </button>
                    {onDeleteFile && (
                        <button
                            onClick={() => onDeleteFile({ car, file, fileType })}
                            className="text-[#6B7280] hover:text-[#DC2626] transition-colors p-1"
                            title={`Eliminar ${file.originalname}`}
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            ) : (
                <p className="text-[14px] font-bold text-[#06122A] uppercase">No hay archivo</p>
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
                <FontAwesomeIcon icon={icon || faPaperclip} className="w-3.5 h-3.5 mr-2 text-[#6B7280]" />
                <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">{label}</span>
            </div>
            {files.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 group bg-[#F2F4F8] px-4 py-2.5 rounded-[10px] border border-[#E5E7EB] hover:border-[#1E3A8A]/30 transition-colors">
                            <button
                                onClick={() => handleDownload(file.path, file.originalname)}
                                className="text-[13px] font-bold text-[#1E3A8A] hover:underline flex items-center gap-2 text-left w-full uppercase truncate"
                                title={file.originalname}
                            >
                                <FontAwesomeIcon icon={faPaperclip} className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{file.originalname}</span>
                            </button>
                            {onDeleteFile && (
                                <button
                                    onClick={() => onDeleteFile({ car, file, fileType })}
                                    className="text-[#6B7280] hover:text-[#DC2626] transition-colors p-1"
                                    title={`Eliminar ${file.originalname}`}
                                >
                                    <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-[14px] font-bold text-[#06122A] uppercase">No hay archivos</p>
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
            <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faFileLines} className="w-3.5 h-3.5 mr-2 text-[#6B7280]" />
                <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">Documento de Reserva</span>
            </div>
            <div className="flex items-center justify-between gap-2 group bg-yellow-100 px-4 py-2.5 rounded-[10px] border border-yellow-200 hover:border-yellow-400 transition-colors">
                <button
                    onClick={() => handleDownload(file.path, file.originalname)}
                    className="text-[13px] font-bold text-yellow-800 hover:underline flex items-center gap-2 text-left w-full uppercase truncate"
                    title={file.originalname}
                >
                    <FontAwesomeIcon icon={faPaperclip} className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{file.originalname}</span>
                </button>
            </div>
        </div>
    );
};