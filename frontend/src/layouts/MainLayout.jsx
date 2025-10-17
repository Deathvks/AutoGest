// autogest-app/frontend/src/layouts/MainLayout.jsx
import React, { useEffect, Suspense, useContext } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCreditCard } from '@fortawesome/free-solid-svg-icons';

// Componentes
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AppRoutes from '../components/AppRoutes';
import AppModals from '../components/AppModals';
// --- INICIO DE LA MODIFICACIÓN ---
// Se elimina la importación del componente de versión
// --- FIN DE LA MODIFICACIÓN ---

const MainLayout = () => {
    const appState = useAppState();
    const { setLogoutModalOpen, isDataLoading } = appState;
    const { user, subscriptionStatus, isRefreshing, promptTrial, isTrialActive } = useContext(AuthContext);
    const location = useLocation();

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se ajusta la lógica para que el modal de prueba no aparezca si el usuario ya está en un equipo.
    useEffect(() => {
        if (promptTrial && user && !user.companyId) {
            appState.setIsTrialModalOpen(true);
        } else {
            // Se asegura de cerrar el modal si el usuario se une a un equipo
            appState.setIsTrialModalOpen(false);
        }
    }, [promptTrial, user, user?.companyId, appState.setIsTrialModalOpen]);
    // --- FIN DE LA MODIFICACIÓN ---

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

    const rolesRequiringSubscription = ['technician_subscribed'];
    
    const hasValidSubscription = subscriptionStatus === 'active' || 
        (subscriptionStatus === 'cancelled' && user && new Date(user.subscriptionExpiry) > new Date());
    
    const isAllowedPath = ['/subscription', '/settings', '/profile'].includes(location.pathname) || location.pathname.startsWith('/accept-invitation');

    if (user && rolesRequiringSubscription.includes(user.role) && !hasValidSubscription && !isAllowedPath) {
        return <Navigate to="/subscription" replace />;
    }
    
    const isUnassignedUser = user && user.role === 'user' && !user.companyId && !isTrialActive;
    const isAllowedUnassignedPath = ['/profile', '/settings', '/subscription'].includes(location.pathname) || location.pathname.startsWith('/accept-invitation');

    if (isUnassignedUser && !isAllowedUnassignedPath) {
        return (
            <div className="flex h-screen bg-background font-sans text-text-secondary">
                <Sidebar onLogoutClick={() => setLogoutModalOpen(true)} />
                <div className="flex flex-col flex-1 min-w-0">
                    <Header appState={appState} />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center no-scrollbar">
                        <div className="w-full max-w-lg space-y-6 rounded-2xl bg-component-bg p-8 text-center shadow-2xl backdrop-blur-lg border border-border-color">
                            <FontAwesomeIcon icon={faUsers} className="text-5xl text-accent mb-4" />
                            <h2 className="text-2xl font-bold text-text-primary">Acción Requerida</h2>
                            <p className="mt-2 text-text-secondary">
                                Para poder usar la aplicación, necesitas unirte a un equipo o tener una suscripción activa.
                            </p>
                            <div className="mt-6">
                                <Link 
                                    to="/subscription" 
                                    className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background w-full sm:w-auto"
                                >
                                    <FontAwesomeIcon icon={faCreditCard} />
                                    <span>Ver Planes de Suscripción</span>
                                </Link>
                            </div>
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
                <Header appState={appState} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 no-scrollbar">
                    <Suspense fallback={<div className="flex h-full w-full items-center justify-center">Cargando página...</div>}>
                        <AppRoutes 
                            appState={appState} 
                            onLogoutClick={() => setLogoutModalOpen(true)} 
                        />
                    </Suspense>
                </main>
            </div>
            <BottomNav />
            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            {/* Se elimina el indicador de versión de esta parte del layout */}
            {/* --- FIN DE LA MODIFICACIÓN --- */}
            <AppModals appState={appState} />
        </div>
    );
};

export default MainLayout;