// AutoGest/frontend/src/hooks/useModalState.js
import { useState } from 'react';

export const useModalState = () => {
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [carToSell, setCarToSell] = useState(null);
    const [carToView, setCarToView] = useState(null);
    const [isAddCarModalOpen, setAddCarModalOpen] = useState(false);
    const [carForIncident, setCarForIncident] = useState(null);
    const [carToEdit, setCarToEdit] = useState(null);
    const [carToDelete, setCarToDelete] = useState(null);
    const [isAddExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
    const [carForExpense, setCarForExpense] = useState(null);
    const [expenseToEdit, setExpenseToEdit] = useState(null);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [incidentToDelete, setIncidentToDelete] = useState(null);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    const [carToReserve, setCarToReserve] = useState(null);
    const [carToCancelReservation, setCarToCancelReservation] = useState(null);
    const [isInvestmentModalOpen, setInvestmentModalOpen] = useState(false);
    const [isRevenueModalOpen, setRevenueModalOpen] = useState(false);
    const [reservationSuccessData, setReservationSuccessData] = useState(null);
    const [carForGestoriaPickup, setCarForGestoriaPickup] = useState(null);
    const [carForGestoriaReturn, setCarForGestoriaReturn] = useState(null);
    const [carToNotify, setCarToNotify] = useState(null);
    const [isBusinessDataModalOpen, setIsBusinessDataModalOpen] = useState(false);
    const [businessDataMessage, setBusinessDataMessage] = useState('');
    // --- INICIO DE LA MODIFICACIÓN ---
    const [isSubscriptionSuccessModalOpen, setSubscriptionSuccessModalOpen] = useState(false);
    // --- FIN DE LA MODIFICACIÓN ---

    return {
        isAddUserModalOpen, setAddUserModalOpen,
        userToEdit, setUserToEdit,
        userToDelete, setUserToDelete,
        carToSell, setCarToSell,
        carToView, setCarToView,
        isAddCarModalOpen, setAddCarModalOpen,
        carForIncident, setCarForIncident,
        carToEdit, setCarToEdit,
        carToDelete, setCarToDelete,
        isAddExpenseModalOpen, setAddExpenseModalOpen,
        carForExpense, setCarForExpense,
        expenseToEdit, setExpenseToEdit,
        expenseToDelete, setExpenseToDelete,
        incidentToDelete, setIncidentToDelete,
        isDeleteAccountModalOpen, setIsDeleteAccountModalOpen,
        carToReserve, setCarToReserve,
        carToCancelReservation, setCarToCancelReservation,
        isInvestmentModalOpen, setInvestmentModalOpen,
        isRevenueModalOpen, setRevenueModalOpen,
        reservationSuccessData, setReservationSuccessData,
        carForGestoriaPickup, setCarForGestoriaPickup,
        carForGestoriaReturn, setCarForGestoriaReturn,
        carToNotify, setCarToNotify,
        isBusinessDataModalOpen, setIsBusinessDataModalOpen,
        businessDataMessage, setBusinessDataMessage,
        // --- INICIO DE LA MODIFICACIÓN ---
        isSubscriptionSuccessModalOpen, setSubscriptionSuccessModalOpen,
        // --- FIN DE LA MODIFICACIÓN ---
    };
};