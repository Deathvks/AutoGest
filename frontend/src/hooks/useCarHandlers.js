// frontend/src/hooks/useCarHandlers.js
import { useCarActions } from './carHandlers/useCarActions';
import { useCarStatus } from './carHandlers/useCarStatus';
import { useCarData } from './carHandlers/useCarData';
import { useCarPDF } from './carHandlers/useCarPDF';
import { useCarFiles } from './carHandlers/useCarFiles';

export const useCarHandlers = (
    setCars,
    setLocations,
    modalState
) => {
    const {
        handleAddCar,
        handleUpdateCar,
        handleDeleteCar,
    } = useCarActions(setCars, setLocations, modalState);

    const {
        handleSellConfirm,
        handleReserveConfirm,
        handleConfirmCancelReservation,
        handleUpdateCarInsurance,
    } = useCarStatus(setCars, modalState);

    const {
        handleDeleteNote,
        handleGestoriaPickup,
        handleGestoriaReturn,
    } = useCarData(setCars, modalState);

    const {
        handleGeneratePdf,
    } = useCarPDF(setCars, setLocations, modalState);

    const {
        handleDeleteFile,
    } = useCarFiles(setCars, setLocations, modalState);

    return {
        handleAddCar,
        handleUpdateCar,
        handleDeleteCar,
        handleSellConfirm,
        handleReserveConfirm,
        handleConfirmCancelReservation,
        handleUpdateCarInsurance,
        handleDeleteNote,
        handleGestoriaPickup,
        handleGestoriaReturn,
        handleGeneratePdf,
        handleDeleteFile,
    };
};