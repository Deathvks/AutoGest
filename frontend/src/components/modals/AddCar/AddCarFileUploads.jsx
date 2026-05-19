// autogest-app/frontend/src/components/modals/AddCar/AddCarFileUploads.jsx
import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faUpload, faCamera, faFileLines, faXmark } from '@fortawesome/free-solid-svg-icons';

const FileUploadSection = ({ label, files, onFileChange, onRemoveFile, fileType, maxFiles }) => {
    const fileInputRef = useRef(null);

    const handleButtonClick = async (isCamera) => {
        try {
            if (!fileInputRef.current) {
                alert('Error: La referencia al input de fichero no existe.');
                return;
            }

            if (isCamera) {
                if (navigator.brave && (await navigator.brave.isBrave())) {
                    alert('Parece que estás usando Brave. Si la cámara no se abre, por favor, desactiva los escudos de Brave (el icono del león en la barra de direcciones) para este sitio y vuelve a intentarlo.');
                }

                fileInputRef.current.setAttribute('accept', 'image/*');
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.removeAttribute('multiple');
            } else {
                fileInputRef.current.setAttribute('accept', 'image/*,application/pdf');
                fileInputRef.current.setAttribute('multiple', 'true');
                fileInputRef.current.removeAttribute('capture');
            }

            fileInputRef.current.click();

        } catch (error) {
            console.error('Error al intentar abrir el selector:', error);
            alert(`Error al activar la función: ${error.message}`);
        }
    };

    return (
        <div className="bg-background/50 p-4 rounded-xl border border-border-color">
            <label className="block text-sm font-semibold text-text-primary mb-3">{label} ({files.length}/{maxFiles})</label>
            <div className="space-y-2">
                {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm bg-background p-2 rounded-lg border border-border-color">
                        <FontAwesomeIcon icon={faFileLines} className="text-text-secondary flex-shrink-0 ml-1" />
                        <span className="flex-1 truncate" title={file.name}>{file.name}</span>
                        <button type="button" onClick={() => onRemoveFile(file, fileType)} className="text-red-accent hover:opacity-75 flex-shrink-0 p-1">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                ))}
            </div>
            {files.length < maxFiles && (
                <div className="flex items-center gap-2 mt-3">
                    <input type="file" ref={fileInputRef} onChange={e => onFileChange(e, fileType)} className="hidden" style={{ display: 'none' }} />
                    <button type="button" onClick={() => handleButtonClick(false)} className="flex-1 bg-component-bg-hover text-text-primary px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-semibold flex items-center justify-center gap-2 border border-border-color">
                        <FontAwesomeIcon icon={faUpload} /> Subir
                    </button>
                    <button type="button" onClick={() => handleButtonClick(true)} className="flex-1 bg-component-bg-hover text-text-primary px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-semibold flex items-center justify-center gap-2 border border-border-color">
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

    // --- INTERCEPTOR Y COMPRESOR PARA IOS/ANDROID ---
    const handleInterceptImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img = new Image();
        img.onload = () => {
            // 1. Definimos un tamaño máximo lógico (Full HD)
            const MAX_WIDTH = 1920;
            const MAX_HEIGHT = 1920;
            let width = img.width;
            let height = img.height;

            // 2. Calculamos las nuevas medidas manteniendo la proporción
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // 3. Dibujamos la imagen ya redimensionada (esto arregla el giro de iOS de paso)
            ctx.drawImage(img, 0, 0, width, height);

            // 4. Comprimimos a JPEG con calidad 80% (0.8)
            canvas.toBlob((blob) => {
                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });

                // Enviamos la foto ultraligera al handler original
                handleImageChange({ target: { files: [newFile] } });
                URL.revokeObjectURL(img.src);
            }, 'image/jpeg', 0.8);
        };
        img.src = URL.createObjectURL(file);
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Imagen Principal</label>
                <div className="flex items-center gap-4">
                    <div className="w-28 h-28 rounded-xl bg-background/50 flex items-center justify-center overflow-hidden border border-border-color flex-shrink-0">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Vista previa" className="h-full w-full object-cover" />
                        ) : (
                            <FontAwesomeIcon icon={faCar} className="text-4xl text-text-secondary" />
                        )}
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        {/* Se sustituye handleImageChange por el interceptor en los inputs */}
                        <input type="file" accept="image/*" ref={imageInputRef} onChange={handleInterceptImage} className="hidden" />
                        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleInterceptImage} className="hidden" />

                        <button type="button" onClick={() => imageInputRef.current.click()} className="w-full bg-component-bg-hover text-text-primary px-3 py-3 rounded-lg hover:bg-border-color transition-colors text-sm font-semibold flex items-center justify-center gap-2 border border-border-color">
                            <FontAwesomeIcon icon={faUpload} /> Subir archivo
                        </button>
                        <button type="button" onClick={() => cameraInputRef.current.click()} className="w-full bg-component-bg-hover text-text-primary px-3 py-3 rounded-lg hover:bg-border-color transition-colors text-sm font-semibold flex items-center justify-center gap-2 border border-border-color">
                            <FontAwesomeIcon icon={faCamera} /> Usar cámara
                        </button>
                    </div>
                </div>
            </div>

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
    );
};

export default AddCarFileUploads;