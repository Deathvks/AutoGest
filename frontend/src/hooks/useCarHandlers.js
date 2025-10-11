// frontend/src/hooks/useCarHandlers.js
import { useCarActions } from './carHandlers/useCarActions';
import { useCarStatus } from './carHandlers/useCarStatus';
import { useCarData } from './carHandlers/useCarData';
import { useCarPDF } from './carHandlers/useCarPDF';
import { useCarFiles } from './carHandlers/useCarFiles';

export const useCarHandlers = ({
    setCars,
    setLocations,
    modalState
}) => {
    // Definimos un objeto con las dependencias para evitar la redundancia
    const context = { setCars, setLocations, modalState };

    const {
        handleAddCar,
        handleUpdateCar,
        handleDeleteCar,
    } = useCarActions(context);

    const {
        handleSellConfirm,
        handleReserveConfirm,
        handleConfirmCancelReservation,
        handleUpdateCarInsurance,
    } = useCarStatus(context);

    const {
        handleDeleteNote,
        handleGestoriaPickup,
        handleGestoriaReturn,
    } = useCarData(context);

    const {
        handleGeneratePdf,
    } = useCarPDF(context);

    const {
        handleDeleteFile,
    } = useCarFiles(context);

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