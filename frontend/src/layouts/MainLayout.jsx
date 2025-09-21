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
    const { isDataLoading, toast, handleUndoDelete, setToast } = appState;
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se obtiene el nuevo estado 'isRefreshing' del contexto.
    const { user, subscriptionStatus, isRefreshing } = useContext(AuthContext);
    // --- FIN DE LA MODIFICACIÓN ---
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

    // --- INICIO DE LA MODIFICACIÓN ---
    // Si se está refrescando la sesión (ej. después de un pago), se muestra una pantalla de carga
    // para pausar la lógica de redirección y esperar a que el estado se actualice.
    if (isRefreshing) {
        return <div className="flex h-screen w-full items-center justify-center bg-background text-text-primary">Actualizando estado de la suscripción...</div>;
    }
    // --- FIN DE LA MODIFICACIÓN ---

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
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                    <Suspense fallback={<div className="flex h-full w-full items-center justify-center">Cargando página...</div>}>
                        <AppRoutes appState={appState} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
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