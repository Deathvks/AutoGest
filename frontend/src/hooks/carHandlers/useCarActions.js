// frontend/src/hooks/carHandlers/useCarActions.js
import { useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

export const useCarActions = ({ setCars, setLocations, modalState }) => {
    // --- INICIO DE LA MODIFICACIÓN ---
    const { user } = useContext(AuthContext);

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

            // Si el usuario es miembro de una compañía pero no el propietario, notificar.
            if (user && user.companyId && !user.isOwner) {
                try {
                    await api.notifications.createCarCreationNotification({
                        carId: createdCar.id,
                        message: `El usuario ${user.name} ha añadido el coche ${createdCar.make} ${createdCar.model} (${createdCar.licensePlate}) sin precio de compra.`,
                    });
                } catch (notificationError) {
                    console.error("Error al crear la notificación:", notificationError);
                    // No detenemos el flujo principal si la notificación falla.
                }
            }

            modalState.setAddCarModalOpen(false);
        } catch (error) {
            console.error("Error al añadir coche:", error);
            throw error;
        }
    };
    // --- FIN DE LA MODIFICACIÓN ---

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