// frontend/src/hooks/carHandlers/useCarFiles.js
import { useCarActions } from './useCarActions';

export const useCarFiles = (setCars, setLocations, modalState) => {
    const { handleUpdateCar } = useCarActions(setCars, setLocations, modalState);

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