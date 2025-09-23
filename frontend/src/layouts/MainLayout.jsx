// autogest-app/frontend/src/layouts/MainLayout.jsx
import React, { useEffect, Suspense, useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { AuthContext } from '../context/AuthContext';

// Componentes
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AppRoutes from '../components/AppRoutes';
import AppModals from '../components/AppModals';
import Toast from '../components/Toast';
import VersionIndicator from '../components/VersionIndicator';

const MainLayout = ({ isDarkMode, setIsDarkMode }) => {
    const appState = useAppState();
    // --- INICIO DE LA MODIFICACIÓN ---
    const { isDataLoading, toast, handleUndoDelete, setToast, setLogoutModalOpen } = appState;
    // --- FIN DE LA MODIFICACIÓN ---
    const { user, subscriptionStatus, isRefreshing } = useContext(AuthContext);
    const location = useLocation();

    useEffect(() => {
        const {
            isAddUserModalOpen, userToEdit, userToDelete, carToSell, carToView,
            isAddCarModalOpen, carForIncident, carToEdit, carToDelete,
            isAddExpenseModalOpen, expenseToEdit, expenseToDelete, incidentToDelete,
            isDeleteAccountModalOpen, carToReserve, carToCancelReservation,
            isInvestmentModalOpen, isRevenueModalOpen, reservationSuccessData
        } = appState;

        const isAnyModalOpen =
            isAddUserModalOpen || !!userToEdit || !!userToDelete || !!carToSell ||
            !!carToView || isAddCarModalOpen || !!carForIncident || !!carToEdit ||
            !!carToDelete || isAddExpenseModalOpen || !!expenseToEdit || !!expenseToDelete ||
            !!incidentToDelete || isDeleteAccountModalOpen || !!carToReserve || !!carToCancelReservation ||
            isInvestmentModalOpen || isRevenueModalOpen || !!reservationSuccessData;

        document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'auto';

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [appState]);

    if (isRefreshing) {
        return <div className="flex h-screen w-full items-center justify-center bg-background text-text-primary">Actualizando estado de la suscripción...</div>;
    }

    const isExempt = user && (user.role === 'admin' || user.role === 'technician');
    const hasActiveSubscription = subscriptionStatus === 'active';
    const isAllowedPath = ['/subscription', '/settings', '/profile'].includes(location.pathname);

    if (user && !isExempt && !hasActiveSubscription && !isAllowedPath) {
        return <Navigate to="/subscription" replace />;
    }
    
    if (isDataLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-background text-text-primary">Cargando datos...</div>;
    }

    return (
        <div className="flex h-screen bg-background font-sans text-text-secondary">
            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            <Sidebar onLogoutClick={() => setLogoutModalOpen(true)} />
            {/* --- FIN DE LA MODIFICACIÓN --- */}
            <div className="flex flex-col flex-1 min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                    <Suspense fallback={<div className="flex h-full w-full items-center justify-center">Cargando página...</div>}>
                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                        <AppRoutes 
                            appState={appState} 
                            isDarkMode={isDarkMode} 
                            setIsDarkMode={setIsDarkMode} 
                            onLogoutClick={() => setLogoutModalOpen(true)} 
                        />
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                    </Suspense>
                </main>
            </div>
            <BottomNav />

            {/* Componentes superpuestos */}
            <VersionIndicator className="hidden lg:block fixed bottom-6 right-6 bg-component-bg px-2 py-1 rounded border border-border-color" />
            {toast && (<Toast message={toast.message} onUndo={handleUndoDelete} onClose={() => setToast(null)} />)}
            
            {/* Contenedor de todos los modales */}
            <AppModals appState={appState} />
        </div>
    );
};

export default MainLayout;