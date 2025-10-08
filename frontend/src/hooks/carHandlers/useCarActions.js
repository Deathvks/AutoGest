// frontend/src/hooks/carHandlers/useCarActions.js
import api from '../../services/api';

export const useCarActions = (setCars, setLocations, modalState) => {
    const fetchLocations = async () => {
        try {
            const locationsData = await api.getLocations();
            setLocations(locationsData);
        } catch (error) {
            console.error("Error al cargar ubicaciones:", error);
        }
    };

    const handleAddCar = async (formData) => {
        try {
            const createdCar = await api.createCar(formData);
            setCars(prev => [createdCar, ...prev]);
            await fetchLocations();
            modalState.setAddCarModalOpen(false);
        } catch (error) {
            console.error("Error al añadir coche:", error);
            throw error;
        }
    };

    const handleUpdateCar = async (carId, formData) => {
        try {
            const updatedCar = await api.updateCar(carId, formData);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));

            if (modalState.carToView && modalState.carToView.id === updatedCar.id) {
                modalState.setCarToView(updatedCar);
            }

            await fetchLocations();

            if (modalState.carToEdit && modalState.carToEdit.id === carId) {
                modalState.setCarToEdit(null);
            }
        } catch (error) {
            console.error("Error al actualizar coche:", error);
            throw error;
        }
    };

    const handleDeleteCar = async (carId) => {
        try {
            await api.deleteCar(carId);
            setCars(prev => prev.filter(c => c.id !== carId));
            modalState.setCarToDelete(null);
            modalState.setCarToView(null);
        } catch (error) {
            console.error("Error al eliminar coche:", error);
        }
    };

    return {
        handleAddCar,
        handleUpdateCar,
        handleDeleteCar,
    };
};