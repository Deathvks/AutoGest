// autogest-app/frontend/src/components/AppRoutes.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Páginas
import Dashboard from '../pages/Dashboard';
import MyCars from '../pages/MyCars';
import SalesSummary from '../pages/SalesSummary';
import Expenses from '../pages/Expenses';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import ManageUsersPage from '../pages/ManageUsersPage';

const AppRoutes = ({ appState, isDarkMode, setIsDarkMode }) => {
    const { user } = useContext(AuthContext);

    // Desestructuramos el estado y los manejadores para pasarlos a las páginas
    const {
        cars,
        expenses,
        allExpenses,
        incidents,
        users,
        setCarToSell,
        setAddCarModalOpen,
        setCarToView,
        setCarForIncident,
        setCarToReserve,
        setCarToCancelReservation,
        handleUpdateCarInsurance,
        setInvestmentModalOpen,
        setRevenueModalOpen,
        setCarForExpense,
        setAddExpenseModalOpen,
        setExpenseToEdit,
        setExpenseToDelete,
        setIsDeleteAccountModalOpen,
        setAddUserModalOpen,
        setUserToEdit,
        setUserToDelete,
    } = appState;

    return (
        <Routes>
            <Route 
                path="/" 
                element={<Dashboard 
                    cars={cars} 
                    expenses={allExpenses} 
                    isDarkMode={isDarkMode} 
                    onTotalInvestmentClick={() => setInvestmentModalOpen(true)} 
                    onRevenueClick={() => setRevenueModalOpen(true)} 
                />} 
            />
            <Route 
                path="/cars" 
                element={<MyCars 
                    cars={cars} 
                    onSellClick={setCarToSell} 
                    onAddClick={() => setAddCarModalOpen(true)} 
                    onViewDetailsClick={setCarToView} 
                    onAddIncidentClick={setCarForIncident} 
                    onReserveClick={setCarToReserve} 
                    onCancelReservationClick={setCarToCancelReservation} 
                    onUpdateInsurance={handleUpdateCarInsurance} 
                />} 
            />
            <Route 
                path="/sales" 
                element={<SalesSummary 
                    cars={cars} 
                    expenses={allExpenses} 
                    onViewDetailsClick={setCarToView} 
                />} 
            />
            <Route 
                path="/expenses" 
                element={<Expenses 
                    expenses={expenses} 
                    onAddExpense={() => { setCarForExpense(null); setAddExpenseModalOpen(true); }} 
                    onEditExpense={setExpenseToEdit} 
                    onDeleteExpense={setExpenseToDelete} 
                />} 
            />
            <Route path="/profile" element={<Profile />} />
            <Route 
                path="/settings" 
                element={<Settings 
                    isDarkMode={isDarkMode} 
                    setIsDarkMode={setIsDarkMode} 
                    cars={cars} 
                    expenses={expenses} 
                    incidents={incidents} 
                    onDeleteAccountClick={() => setIsDeleteAccountModalOpen(true)} 
                />} 
            />
            <Route 
                path="/admin" 
                element={user && user.role === 'admin' 
                    ? <ManageUsersPage 
                        users={users} 
                        onAddUser={() => setAddUserModalOpen(true)} 
                        onEditUser={setUserToEdit} 
                        onDeleteUser={setUserToDelete} 
                      /> 
                    : <Navigate to="/" replace />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;