// AutoGest/frontend/src/hooks/useExpenseHandlers.js
import api from '../services/api';

export const useExpenseHandlers = ({ // Se modifica la firma para aceptar un objeto
    setExpenses,
    setAllExpenses,
    modalState
}) => {
    const handleAddExpense = async (expenseData) => {
        try {
            const newExpense = await api.createExpense(expenseData);
            if (!expenseData.has('carLicensePlate')) {
                setExpenses(prev => [newExpense, ...prev]);
            }
            setAllExpenses(prev => [newExpense, ...prev]);
            modalState.setAddExpenseModalOpen(false);
            modalState.setCarForExpense(null);
            if (modalState.carToView) modalState.setCarToView(prev => ({ ...prev }));
        } catch (error) {
            console.error("Error al añadir gasto:", error);
            throw error;
        }
    };

    const handleUpdateExpense = async (expenseId, formData) => {
        try {
            const updatedExpense = await api.updateExpense(expenseId, formData);
            if (!updatedExpense.carLicensePlate) {
                setExpenses(prev => prev.map(exp => (exp.id === expenseId ? updatedExpense : exp)));
            }
            setAllExpenses(prev => prev.map(exp => (exp.id === expenseId ? updatedExpense : exp)));
            modalState.setExpenseToEdit(null);
            if (modalState.carToView) modalState.setCarToView(prev => ({ ...prev }));
        } catch (error) {
            console.error("Error al actualizar gasto:", error);
            throw error;
        }
    };

    const confirmDeleteExpense = async (expenseId) => {
        try {
            await api.deleteExpense(expenseId);
            setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
            setAllExpenses(prev => prev.filter(exp => exp.id !== expenseId));
            if (modalState.carToView) modalState.setCarToView(prev => ({ ...prev }));
        } catch (error) {
            console.error("Error al eliminar gasto:", error);
        } finally {
            modalState.setExpenseToDelete(null);
        }
    };

    return {
        handleAddExpense,
        handleUpdateExpense,
        confirmDeleteExpense,
    };
};