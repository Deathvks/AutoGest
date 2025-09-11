// autogest-app/frontend/src/components/modals/AddCar/AddCarFileUploads.jsx
import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faUpload, faCamera, faFileLines, faXmark } from '@fortawesome/free-solid-svg-icons';

const FileUploadSection = ({ label, files, onFileChange, onRemoveFile, fileType, maxFiles }) => {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{label} (Máx. {maxFiles})</label>
            <div className="space-y-2">
                {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm bg-background p-2 rounded-md border border-border-color">
                        <FontAwesomeIcon icon={faFileLines} className="text-text-secondary flex-shrink-0" />
                        <span className="flex-1 truncate" title={file.name}>{file.name}</span>
                        <button type="button" onClick={() => onRemoveFile(file, fileType)} className="text-red-accent hover:opacity-75 flex-shrink-0">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                ))}
            </div>
            {files.length < maxFiles && (
                 <div className="flex items-center gap-2 mt-2">
                    <input type="file" multiple accept="image/*,application/pdf" ref={fileInputRef} onChange={e => onFileChange(e, fileType)} className="hidden" />
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <input type="file" multiple accept="image/*" capture="environment" ref={cameraInputRef} onChange={e => onFileChange(e, fileType)} className="hidden" />
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                    <button type="button" onClick={() => fileInputRef.current.click()} className="flex-1 bg-component-bg-hover text-text-secondary px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-border-color">
                        <FontAwesomeIcon icon={faUpload} /> Subir
                    </button>
                    <button type="button" onClick={() => cameraInputRef.current.click()} className="flex-1 bg-component-bg-hover text-text-secondary px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-border-color">
                        <FontAwesomeIcon icon={faCamera} /> Cámara
                    </button>
                </div>
            )}
        </div>
    );
};

const AddCarFileUploads = (props) => {
    const {
        imagePreview,
        handleImageChange,
        technicalSheetFiles,
        registrationCertificateFiles,
        otherDocumentFiles,
        handleFileChange,
        handleRemoveFile
    } = props;

    const imageInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    return (
        <>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Imagen Principal</label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border-color flex-shrink-0">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Vista previa" className="h-full w-full object-cover" />
                        ) : (
                            <FontAwesomeIcon icon={faCar} className="text-3xl text-text-secondary" />
                        )}
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
                        <button type="button" onClick={() => imageInputRef.current.click()} className="w-full bg-component-bg-hover text-text-secondary px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-border-color">
                            <FontAwesomeIcon icon={faUpload} /> Subir archivo
                        </button>
                        <button type="button" onClick={() => cameraInputRef.current.click()} className="w-full bg-component-bg-hover text-text-secondary px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-border-color">
                            <FontAwesomeIcon icon={faCamera} /> Usar cámara
                        </button>
                    </div>
                </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-border-color">
                <FileUploadSection 
                    label="Ficha Técnica"
                    files={technicalSheetFiles}
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveFile}
                    fileType="technicalSheet"
                    maxFiles={2}
                />
                <FileUploadSection 
                    label="Permiso de Circulación"
                    files={registrationCertificateFiles}
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveFile}
                    fileType="registrationCertificate"
                    maxFiles={2}
                />
                <FileUploadSection 
                    label="Archivos Varios"
                    files={otherDocumentFiles}
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveFile}
                    fileType="otherDocuments"
                    maxFiles={6} 
                />
            </div>
        </>
    );
};

export default AddCarFileUploads;