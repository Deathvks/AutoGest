// frontend/src/hooks/carHandlers/useCarFiles.js
import { useCarActions } from './useCarActions';

export const useCarFiles = ({ setCars, setLocations, modalState }) => {
    // Se crea un objeto de contexto para pasar todas las dependencias
    const context = { setCars, setLocations, modalState };
    
    // Se llama a useCarActions con el objeto de contexto
    const { handleUpdateCar } = useCarActions(context);

    const handleDeleteFile = async (fileData) => {
        const { car, file, fileType } = fileData;
        try {
            const formData = new FormData();
            const filesToRemove = [{ path: file.path, type: fileType }];
            formData.append('filesToRemove', JSON.stringify(filesToRemove));
            
            await handleUpdateCar(car.id, formData);

        } catch (error) {
            console.error("Error al eliminar el archivo:", error);
        } finally {
            modalState.setFileToDelete(null);
        }
    };

    return {
        handleDeleteFile,
    };
};