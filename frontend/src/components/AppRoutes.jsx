// autogest-app/frontend/src/components/AppRoutes.jsx
import React, { useContext, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Páginas (carga perezosa para code-splitting)
const Dashboard = lazy(() => import('../pages/Dashboard'));
const MyCars = lazy(() => import('../pages/MyCars'));
const SalesSummary = lazy(() => import('../pages/SalesSummary'));
const Expenses = lazy(() => import('../pages/Expenses'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const ManageUsersPage = lazy(() => import('../pages/ManageUsersPage'));
// --- INICIO DE LA MODIFICACIÓN ---
const SubscriptionPage = lazy(() => import('../pages/SubscriptionPage'));
// --- FIN DE LA MODIFICACIÓN ---

const AppRoutes = ({ appState, isDarkMode, setIsDarkMode }) => {
    const { user } = useContext(AuthContext);

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
        setIsBusinessDataModalOpen,
        businessDataMessage,
        setSubscriptionSuccessModalOpen, // <-- AÑADIDO PARA PASARLO
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
                    onBusinessDataClick={() => setIsBusinessDataModalOpen(true)}
                    businessDataMessage={businessDataMessage}
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
            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            <Route 
                path="/subscription" 
                element={<SubscriptionPage setSubscriptionSuccessModalOpen={setSubscriptionSuccessModalOpen} />} 
            />
            {/* --- FIN DE LA MODIFICACIÓN --- */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;