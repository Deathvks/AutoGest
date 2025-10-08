// frontend/src/hooks/carHandlers/useCarData.js
import api from '../../services/api';

export const useCarData = (setCars, modalState) => {

    const handleDeleteNote = async (car, noteIdToDelete) => {
        try {
            let notes = [];
            if (car.notes) {
                try {
                    const parsed = JSON.parse(car.notes);
                    if (Array.isArray(parsed)) notes = parsed;
                } catch (e) { }
            }
            const updatedNotes = notes.filter(note => note.id !== noteIdToDelete);
            const updatedCarData = await api.updateCar(car.id, { notes: JSON.stringify(updatedNotes) });
            setCars(prev => prev.map(c => (c.id === updatedCarData.id ? updatedCarData : c)));
            modalState.setCarToView({ ...updatedCarData });
        } catch (error) { console.error("Error al eliminar la nota:", error); }
    };

    const handleGestoriaPickup = async (car, pickupDate) => {
        try {
            const updatedCar = await api.updateCar(car.id, { gestoriaPickupDate: pickupDate });
            const updateState = (prevCar) => (prevCar.id === updatedCar.id ? updatedCar : prevCar);
            setCars(prev => prev.map(updateState));
            if (modalState.carToView?.id === car.id) {
                modalState.setCarToView(updatedCar);
            }
            modalState.setCarForGestoriaPickup(null);
        } catch (error) {
            console.error("Error al registrar la recogida de la gestoría:", error);
        }
    };

    const handleGestoriaReturn = async (car, returnDate) => {
         try {
            const updatedCar = await api.updateCar(car.id, { gestoriaReturnDate: returnDate });
            const updateState = (prevCar) => (prevCar.id === updatedCar.id ? updatedCar : prevCar);
            setCars(prev => prev.map(updateState));
            if (modalState.carToView?.id === car.id) {
                modalState.setCarToView(updatedCar);
            }
            modalState.setCarForGestoriaReturn(null);
            modalState.setCarToNotify(updatedCar);
        } catch (error) {
            console.error("Error al registrar la entrega de la gestoría:", error);
        }
    };

    return {
        handleDeleteNote,
        handleGestoriaPickup,
        handleGestoriaReturn,
    };
};