// AutoGest/frontend/src/hooks/useExpenseHandlers.js
import api from '../services/api';

export const useExpenseHandlers = ({
    setExpenses,
    setAllExpenses,
    setCars, // Añadimos setCars aquí
    allExpenses, // Lo necesitamos para saber qué coche pierde el gasto al borrar
    modalState
}) => {
    const handleAddExpense = async (expenseData) => {
        try {
            const newExpense = await api.createExpense(expenseData);
            const carLicensePlate = expenseData.get ? expenseData.get('carLicensePlate') : expenseData.carLicensePlate;

            if (!carLicensePlate) {
                setExpenses(prev => [newExpense, ...prev]);
            } else {
                // ACTUALIZACIÓN INSTANTÁNEA DEL COCHE: Metemos el gasto en el coche correspondiente
                setCars(prevCars => prevCars.map(car => {
                    if (car.licensePlate === carLicensePlate) {
                        return { ...car, expenses: [...(car.expenses || []), newExpense] };
                    }
                    return car;
                }));
            }

            setAllExpenses(prev => [newExpense, ...prev]);
            modalState.setAddExpenseModalOpen(false);
            modalState.setCarForExpense(null);

            if (modalState.carToView && modalState.carToView.licensePlate === carLicensePlate) {
                modalState.setCarToView(prev => ({ ...prev, expenses: [...(prev.expenses || []), newExpense] }));
            }
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
            } else {
                // ACTUALIZACIÓN INSTANTÁNEA DEL COCHE
                setCars(prevCars => prevCars.map(car => {
                    if (car.licensePlate === updatedExpense.carLicensePlate) {
                        const newExpenses = (car.expenses || []).map(exp => exp.id === expenseId ? updatedExpense : exp);
                        return { ...car, expenses: newExpenses };
                    }
                    return car;
                }));
            }

            setAllExpenses(prev => prev.map(exp => (exp.id === expenseId ? updatedExpense : exp)));
            modalState.setExpenseToEdit(null);

            if (modalState.carToView && modalState.carToView.licensePlate === updatedExpense.carLicensePlate) {
                const newExpenses = (modalState.carToView.expenses || []).map(exp => exp.id === expenseId ? updatedExpense : exp);
                modalState.setCarToView(prev => ({ ...prev, expenses: newExpenses }));
            }
        } catch (error) {
            console.error("Error al actualizar gasto:", error);
            throw error;
        }
    };

    const confirmDeleteExpense = async (expenseId) => {
        try {
            const expenseToDelete = allExpenses?.find(exp => exp.id === expenseId);
            await api.deleteExpense(expenseId);

            setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
            setAllExpenses(prev => prev.filter(exp => exp.id !== expenseId));

            // Si el gasto era de un coche, lo quitamos de su array al instante
            if (expenseToDelete?.carLicensePlate) {
                setCars(prevCars => prevCars.map(car => {
                    if (car.licensePlate === expenseToDelete.carLicensePlate) {
                        return { ...car, expenses: (car.expenses || []).filter(e => e.id !== expenseId) };
                    }
                    return car;
                }));

                if (modalState.carToView?.licensePlate === expenseToDelete.carLicensePlate) {
                    modalState.setCarToView(prev => ({ ...prev, expenses: (prev.expenses || []).filter(e => e.id !== expenseId) }));
                }
            }
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