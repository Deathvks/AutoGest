// autogest-app/frontend/src/components/modals/EditCar/EditCarFileUploads.jsx
import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faUpload, faCamera, faFileLines, faXmark } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const FileUploadSection = ({ label, existingFiles = [], newFiles = [], onFileChange, onRemoveNewFile, onRemoveExistingFile, fileType, maxFiles }) => {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const totalFiles = (existingFiles?.length || 0) + newFiles.length;

    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{label} (Máx. {maxFiles})</label>
            <div className="space-y-2">
                {/* Archivos existentes */}
                {existingFiles && existingFiles.map((file, index) => (
                    <div key={`existing-${index}`} className="flex items-center gap-2 text-sm bg-background p-2 rounded-md border border-border-color">
                        <FontAwesomeIcon icon={faFileLines} className="text-text-secondary flex-shrink-0" />
                        <a href={`${API_BASE_URL}${file.path}`} target="_blank" rel="noopener noreferrer" className="flex-1 truncate hover:underline" title={file.originalname}>{file.originalname}</a>
                        <button type="button" onClick={() => onRemoveExistingFile(file, fileType)} className="text-red-accent hover:opacity-75 flex-shrink-0">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                ))}
                {/* Nuevos archivos */}
                {newFiles.map((file, index) => (
                    <div key={`new-${index}`} className="flex items-center gap-2 text-sm bg-background p-2 rounded-md border border-border-color">
                        <FontAwesomeIcon icon={faFileLines} className="text-text-secondary flex-shrink-0" />
                        <span className="flex-1 truncate" title={file.name}>{file.name}</span>
                        <button type="button" onClick={() => onRemoveNewFile(file, fileType)} className="text-red-accent hover:opacity-75 flex-shrink-0">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                ))}
            </div>
            {totalFiles < maxFiles && (
                 <div className="flex items-center gap-2 mt-2">
                    <input type="file" multiple accept="image/*,application/pdf" ref={fileInputRef} onChange={e => onFileChange(e, fileType)} className="hidden" />
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={e => onFileChange(e, fileType)} className="hidden" />
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

const EditCarFileUploads = (props) => {
    const {
        editedCar,
        imagePreview,
        handleImageChange,
        newTechnicalSheetFiles,
        newRegistrationCertificateFiles,
        newOtherDocumentFiles,
        handleFileChange,
        handleRemoveNewFile,
        handleRemoveExistingFile
    } = props;
    
    const imageInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    return (
        <>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Imagen Principal</label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border-color flex-shrink-0">
                        <img src={imagePreview || (editedCar.imageUrl ? `${API_BASE_URL}${editedCar.imageUrl}` : `https://placehold.co/400x300/e2e8f0/1e293b?text=${editedCar.make}`)} alt="Vista previa" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
                        <button type="button" onClick={() => imageInputRef.current.click()} className="w-full bg-component-bg-hover text-text-secondary px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-border-color">
                            <FontAwesomeIcon icon={faUpload} /> Cambiar Imagen
                        </button>
                        <button type="button" onClick={() => cameraInputRef.current.click()} className="w-full bg-component-bg-hover text-text-secondary px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-border-color">
                            <FontAwesomeIcon icon={faCamera} /> Usar Cámara
                        </button>
                    </div>
                </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-border-color">
                <FileUploadSection 
                    label="Ficha Técnica"
                    existingFiles={editedCar.technicalSheetUrl}
                    newFiles={newTechnicalSheetFiles}
                    onFileChange={handleFileChange}
                    onRemoveNewFile={handleRemoveNewFile}
                    onRemoveExistingFile={handleRemoveExistingFile}
                    fileType="technicalSheet"
                    maxFiles={2}
                />
                <FileUploadSection 
                    label="Permiso de Circulación"
                    existingFiles={editedCar.registrationCertificateUrl}
                    newFiles={newRegistrationCertificateFiles}
                    onFileChange={handleFileChange}
                    onRemoveNewFile={handleRemoveNewFile}
                    onRemoveExistingFile={handleRemoveExistingFile}
                    fileType="registrationCertificate"
                    maxFiles={2}
                />
                <FileUploadSection 
                    label="Archivos Varios"
                    existingFiles={editedCar.otherDocumentsUrls}
                    newFiles={newOtherDocumentFiles}
                    onFileChange={handleFileChange}
                    onRemoveNewFile={handleRemoveNewFile}
                    onRemoveExistingFile={handleRemoveExistingFile}
                    fileType="otherDocuments"
                    maxFiles={6}
                />
            </div>
        </>
    );
};

export default EditCarFileUploads;