// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsUtils.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faFileLines } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export const DetailItem = ({ icon, label, value }) => (
    <div className="flex flex-col">
        <div className="flex items-center text-sm text-text-secondary mb-1">
            <FontAwesomeIcon icon={icon} className="w-4 h-4 mr-2" />
            <span>{label}</span>
        </div>
        <p className="font-semibold text-text-primary break-words">{value || 'No especificado'}</p>
    </div>
);

const handleDownload = async (url, filename) => {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`);
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

export const SingleFileLink = ({ label, icon, fileData }) => {
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
            <div className="flex items-center text-sm text-text-secondary mb-1">
                <FontAwesomeIcon icon={icon || faFileLines} className="w-4 h-4 mr-2" />
                <span>{label}</span>
            </div>
            {file && file.path ? (
                <button
                    onClick={() => handleDownload(file.path, file.originalname)}
                    className="text-sm font-semibold text-blue-accent hover:underline flex items-center gap-2 text-left w-full"
                    title={file.originalname}
                >
                    <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{file.originalname}</span>
                </button>
            ) : (
                <p className="font-semibold text-text-primary">No hay archivo</p>
            )}
        </div>
    );
};

export const MultiFileLinks = ({ label, icon, filesData }) => {
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
            <div className="flex items-center text-sm text-text-secondary mb-1">
                <FontAwesomeIcon icon={icon || faPaperclip} className="w-4 h-4 mr-2" />
                <span>{label}</span>
            </div>
            {files.length > 0 ? (
                <div className="flex flex-col gap-1">
                    {files.map((file, index) => (
                        <button
                            onClick={() => handleDownload(file.path, file.originalname)}
                            key={index}
                            className="text-sm font-semibold text-blue-accent hover:underline flex items-center gap-2 text-left w-full"
                            title={file.originalname}
                        >
                            <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{file.originalname}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="font-semibold text-text-primary">No hay archivos</p>
            )}
        </div>
    );
};