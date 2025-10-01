// autogest-app/frontend/src/layouts/MainLayout.jsx
import React, { useEffect, Suspense, useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

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
    const { isDataLoading, toast, handleUndoDelete, setToast, setLogoutModalOpen } = appState;
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

    // El rol 'technician' NO está en esta lista, por lo que no se le pedirá suscripción.
    const rolesRequiringSubscription = ['technician_subscribed'];
    
    const hasValidSubscription = subscriptionStatus === 'active' || 
        (subscriptionStatus === 'cancelled' && user && new Date(user.subscriptionExpiry) > new Date());
    
    const isAllowedPath = ['/subscription', '/settings', '/profile'].includes(location.pathname) || location.pathname.startsWith('/accept-invitation');

    if (user && rolesRequiringSubscription.includes(user.role) && !hasValidSubscription && !isAllowedPath) {
        return <Navigate to="/subscription" replace />;
    }
    
    const isUnassignedUser = user && user.role === 'user' && !user.companyId;
    const isAllowedUnassignedPath = ['/profile', '/settings', '/subscription'].includes(location.pathname) || location.pathname.startsWith('/accept-invitation');

    if (isUnassignedUser && !isAllowedUnassignedPath) {
        return (
            <div className="flex h-screen bg-background font-sans text-text-secondary">
                <Sidebar onLogoutClick={() => setLogoutModalOpen(true)} />
                <div className="flex flex-col flex-1 min-w-0">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                        <div className="text-center bg-component-bg p-8 rounded-xl border border-border-color shadow-sm max-w-lg">
                            <FontAwesomeIcon icon={faUsers} className="text-5xl text-accent mb-4" />
                            <h2 className="text-2xl font-bold text-text-primary">Acción Requerida</h2>
                            <p className="mt-2 text-text-secondary">
                                Para poder usar la aplicación, necesitas unirte a un equipo o tener una suscripción activa.
                            </p>
                        </div>
                    </main>
                </div>
                <BottomNav />
                <AppModals appState={appState} />
            </div>
        );
    }

    if (isDataLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-background text-text-primary">Cargando datos...</div>;
    }

    return (
        <div className="flex h-screen bg-background font-sans text-text-secondary">
            <Sidebar onLogoutClick={() => setLogoutModalOpen(true)} />
            <div className="flex flex-col flex-1 min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                    <Suspense fallback={<div className="flex h-full w-full items-center justify-center">Cargando página...</div>}>
                        <AppRoutes 
                            appState={appState} 
                            isDarkMode={isDarkMode} 
                            setIsDarkMode={setIsDarkMode} 
                            onLogoutClick={() => setLogoutModalOpen(true)} 
                        />
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