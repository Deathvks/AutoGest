// AutoGest/frontend/src/hooks/useAppState.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useModalState } from './useModalState';
import { useDataFetching } from './useDataFetching';
import { useCarHandlers } from './useCarHandlers';
import { useExpenseHandlers } from './useExpenseHandlers';
import { useIncidentHandlers } from './useIncidentHandlers';
import { useUserHandlers } from './useUserHandlers';

export const useAppState = () => {
    const { updateUserProfile } = useContext(AuthContext);

    // 1. Hook para gestionar el estado de los modales
    const modalState = useModalState();

    // 2. Hook para cargar todos los datos de la aplicación
    const {
        isDataLoading,
        cars, setCars,
        expenses, setExpenses,
        allExpenses, setAllExpenses,
        incidents, setIncidents,
        locations, setLocations,
        users, setUsers
    } = useDataFetching();

    // 3. Hooks que contienen la lógica de negocio (handlers)
    const carHandlers = useCarHandlers(setCars, setLocations, modalState);
    
    const { handleAddExpense, handleUpdateExpense, confirmDeleteExpense } = useExpenseHandlers(
        setExpenses, setAllExpenses, modalState
    );
    
    const { handleAddIncident, handleDeleteIncident, confirmDeleteIncident, handleResolveIncident } = useIncidentHandlers(
        incidents, setIncidents, modalState
    );
    
    const { handleUserAdded, handleUserUpdated, handleUserDeleted, handleExpelUser } = useUserHandlers(setUsers, modalState);
    
    // Handler específico que necesita acceso al AuthContext
    const handleSaveBusinessData = async (formData) => {
        try {
            await updateUserProfile(formData);
            modalState.setIsBusinessDataModalOpen(false);
            modalState.setBusinessDataMessage('¡DATOS GUARDADOS CON ÉXITO!');
            setTimeout(() => modalState.setBusinessDataMessage(''), 4000);
        } catch (error) {
            console.error("Error al guardar datos de empresa:", error);
            throw error;
        }
    };

    // 4. Unir todos los estados y handlers en un solo objeto
    return {
        // Datos y estado de carga
        isDataLoading,
        cars,
        expenses,
        allExpenses,
        incidents,
        locations,
        users,

        // Todos los estados de los modales
        ...modalState,
        
        // Todos los handlers
        ...carHandlers,
        handleUserAdded,
        handleUserUpdated,
        handleUserDeleted,
        handleExpelUser,
        handleAddIncident,
        handleDeleteIncident,
        confirmDeleteIncident,
        handleResolveIncident,
        handleAddExpense,
        handleUpdateExpense,
        confirmDeleteExpense,
        handleSaveBusinessData,
    };
};