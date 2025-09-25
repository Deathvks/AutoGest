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
const SubscriptionPage = lazy(() => import('../pages/SubscriptionPage'));

const AppRoutes = ({ appState, isDarkMode, setIsDarkMode, onLogoutClick }) => { // <-- Recibimos onLogoutClick
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
        setSubscriptionSuccessModalOpen,
    } = appState;

    if (!user) {
        return null; // No renderizar nada si el usuario aún no está cargado
    }

    const userHomePath = user.role === 'user' ? '/cars' : '/';

    return (
        <Routes>
            <Route 
                path="/" 
                element={
                    (user.role === 'admin' || user.role === 'technician') ? (
                        <Dashboard 
                            cars={cars} 
                            expenses={allExpenses} 
                            isDarkMode={isDarkMode} 
                            onTotalInvestmentClick={() => setInvestmentModalOpen(true)} 
                            onRevenueClick={() => setRevenueModalOpen(true)} 
                        />
                    ) : (
                        <Navigate to="/cars" replace />
                    )
                } 
            />
            <Route 
                path="/cars" 
                element={<MyCars 
                    cars={cars} 
                    // --- INICIO DE LA MODIFICACIÓN ---
                    // Se elimina la prop 'locations' que ya no es necesaria
                    // --- FIN DE LA MODIFICACIÓN ---
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
                    onLogoutClick={onLogoutClick} // <-- Pasamos la función a Settings
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
                    : <Navigate to={userHomePath} replace />} 
            />
            <Route 
                path="/subscription" 
                element={<SubscriptionPage setSubscriptionSuccessModalOpen={setSubscriptionSuccessModalOpen} />} 
            />
            <Route path="*" element={<Navigate to={userHomePath} replace />} />
        </Routes>
    );
};

export default AppRoutes;