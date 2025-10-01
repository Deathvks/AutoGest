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
const AcceptInvitationPage = lazy(() => import('../pages/AcceptInvitationPage')); // <-- Asegurarse de que esté importado

const AppRoutes = ({ appState, isDarkMode, setIsDarkMode, onLogoutClick }) => {
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
        setUserToExpel,
    } = appState;

    if (!user) {
        return null; // No renderizar nada si el usuario aún no está cargado
    }

    const technicianRoles = ['admin', 'technician', 'technician_subscribed'];
    const userHomePath = technicianRoles.includes(user.role) ? '/' : '/cars';

    return (
        <Routes>
            <Route 
                path="/" 
                element={
                    (user.role === 'admin' || user.role === 'technician' || user.role === 'technician_subscribed') ? (
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
                    onLogoutClick={onLogoutClick}
                />} 
            />
            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            <Route 
                path="/admin" 
                element={(user.role === 'admin' || user.role === 'technician' || user.role === 'technician_subscribed' || user.canExpelUsers)
                    ? <ManageUsersPage 
                        users={users} 
                        onAddUser={() => setAddUserModalOpen(true)} 
                        onEditUser={setUserToEdit} 
                        onDeleteUser={setUserToDelete}
                        onExpelUser={setUserToExpel}
                      /> 
                    : <Navigate to={userHomePath} replace />} 
            />
            {/* --- FIN DE LA MODIFICACIÓN --- */}
            <Route 
                path="/subscription" 
                element={<SubscriptionPage setSubscriptionSuccessModalOpen={setSubscriptionSuccessModalOpen} />} 
            />
            <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />
            <Route path="*" element={<Navigate to={userHomePath} replace />} />
        </Routes>
    );
};

export default AppRoutes;