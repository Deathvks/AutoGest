// autogest-app/frontend/src/components/AppModals.jsx
import React from 'react';

// Importa todos los componentes de modales
import CarDetailsModalContent from './modals/CarDetailsModalContent';
import SellCarModal from './modals/SellCarModal';
import AddCarModal from './modals/AddCarModal';
import EditCarModal from './modals/EditCarModal';
import AddIncidentModal from './modals/AddIncidentModal';
import DeleteCarConfirmationModal from './modals/DeleteCarConfirmationModal';
import AddExpenseModal from './modals/AddExpenseModal';
import EditExpenseModal from './modals/EditExpenseModal';
import ReserveCarModal from './modals/ReserveCarModal';
import CancelReservationModal from './modals/CancelReservationModal';
import DeleteExpenseConfirmationModal from './modals/DeleteExpenseConfirmationModal';
import DeleteAccountConfirmationModal from './modals/DeleteAccountConfirmationModal';
import DeleteIncidentConfirmationModal from './modals/DeleteIncidentConfirmationModal';
import AddUserModal from './modals/AddUserModal';
import EditUserModal from './modals/EditUserModal';
import DeleteUserConfirmationModal from './modals/DeleteUserConfirmationModal';
import InvestmentDetailsModal from './modals/InvestmentDetailsModal';
import RevenueDetailsModal from './modals/RevenueDetailsModal';
import ReservationPdfModal from './modals/ReservationPdfModal';
// --- INICIO DE LA MODIFICACIÓN ---
import GestoriaPickupModal from './modals/GestoriaPickupModal';
import GestoriaReturnModal from './modals/GestoriaReturnModal';
import NotifyClientModal from './modals/NotifyClientModal';
// --- FIN DE LA MODIFICACIÓN ---

const AppModals = ({ appState }) => {
    // Desestructuramos todo lo que necesitamos de appState
    const {
        // Datos
        incidents,
        locations,
        allExpenses,
        cars,
        users,

        // Estados de Modales
        isAddUserModalOpen, setAddUserModalOpen,
        userToEdit, setUserToEdit,
        userToDelete, setUserToDelete,
        carToSell, setCarToSell,
        carToView, setCarToView,
        isAddCarModalOpen, setAddCarModalOpen,
        carForIncident, setCarForIncident,
        carToEdit, setCarToEdit,
        carToDelete, setCarToDelete,
        isAddExpenseModalOpen, setAddExpenseModalOpen,
        carForExpense, setCarForExpense,
        expenseToEdit, setExpenseToEdit,
        expenseToDelete, setExpenseToDelete,
        incidentToDelete, setIncidentToDelete,
        isDeleteAccountModalOpen, setIsDeleteAccountModalOpen,
        carToReserve, setCarToReserve,
        carToCancelReservation, setCarToCancelReservation,
        isInvestmentModalOpen, setInvestmentModalOpen,
        isRevenueModalOpen, setRevenueModalOpen,
        reservationSuccessData, setReservationSuccessData,
        carForGestoriaPickup, setCarForGestoriaPickup, // <--- NUEVO
        carForGestoriaReturn, setCarForGestoriaReturn, // <--- NUEVO
        carToNotify, setCarToNotify,                   // <--- NUEVO

        // Handlers
        handleUserAdded,
        handleUserUpdated,
        handleUserDeleted,
        handleAddCar,
        handleUpdateCar,
        handleDeleteCar,
        handleSellConfirm,
        handleReserveConfirm,
        handleConfirmCancelReservation,
        handleDeleteNote,
        handleAddIncident,
        handleDeleteIncident,
        confirmDeleteIncident,
        handleResolveIncident,
        handleAddExpense,
        handleUpdateExpense,
        confirmDeleteExpense,
        handleGestoriaPickup, // <--- NUEVO
        handleGestoriaReturn  // <--- NUEVO
    } = appState;

    return (
        <>
            {carToView && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCarToView(null)}>
                    <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <CarDetailsModalContent
                            car={carToView}
                            incidents={incidents.filter(inc => inc.carId === carToView.id)}
                            onClose={() => setCarToView(null)}
                            onSellClick={car => { setCarToView(null); setCarToSell(car); }}
                            onEditClick={(car) => { setCarToView(null); setCarToEdit(car); }}
                            onDeleteClick={setCarToDelete}
                            onReserveClick={car => { setCarToView(null); setCarToReserve(car); }}
                            onCancelReservationClick={setCarToCancelReservation}
                            onResolveIncident={handleResolveIncident}
                            onDeleteIncident={handleDeleteIncident}
                            onDeleteNote={handleDeleteNote}
                            onAddExpenseClick={(car) => { setCarForExpense(car); setAddExpenseModalOpen(true); }}
                            onEditExpenseClick={setExpenseToEdit}
                            onDeleteExpense={setExpenseToDelete}
                            onAddIncidentClick={(car) => { setCarToView(null); setCarForIncident(car); }}
                            // --- INICIO DE LA MODIFICACIÓN ---
                            onGestoriaPickupClick={(car) => { setCarToView(null); setCarForGestoriaPickup(car); }}
                            onGestoriaReturnClick={(car) => { setCarToView(null); setCarForGestoriaReturn(car); }}
                            // --- FIN DE LA MODIFICACIÓN ---
                        />
                    </div>
                </div>
            )}
            
            {isAddCarModalOpen && <AddCarModal onClose={() => setAddCarModalOpen(false)} onAdd={handleAddCar} locations={locations} />}
            {carToEdit && <EditCarModal car={carToEdit} onClose={() => setCarToEdit(null)} onUpdate={handleUpdateCar} locations={locations} />}
            {carToSell && <SellCarModal car={carToSell} onClose={() => setCarToSell(null)} onConfirm={handleSellConfirm} />}
            {carForIncident && <AddIncidentModal car={carForIncident} onClose={() => setCarForIncident(null)} onConfirm={handleAddIncident} />}
            {carToDelete && <DeleteCarConfirmationModal car={carToDelete} onClose={() => setCarToDelete(null)} onConfirm={handleDeleteCar} />}
            {isAddExpenseModalOpen && <AddExpenseModal car={carForExpense} onClose={() => { setAddExpenseModalOpen(false); setCarForExpense(null); }} onAdd={handleAddExpense} />}
            {expenseToEdit && <EditExpenseModal expense={expenseToEdit} onClose={() => setExpenseToEdit(null)} onUpdate={handleUpdateExpense} />}
            {expenseToDelete && <DeleteExpenseConfirmationModal expense={expenseToDelete} onClose={() => setExpenseToDelete(null)} onConfirm={confirmDeleteExpense} />}
            {incidentToDelete && <DeleteIncidentConfirmationModal incident={incidentToDelete} onClose={() => setIncidentToDelete(null)} onConfirm={confirmDeleteIncident} />}
            {isDeleteAccountModalOpen && <DeleteAccountConfirmationModal onClose={() => setIsDeleteAccountModalOpen(false)} />}
            {carToReserve && <ReserveCarModal car={carToReserve} onClose={() => setCarToReserve(null)} onConfirm={handleReserveConfirm} />}
            {carToCancelReservation && <CancelReservationModal car={carToCancelReservation} onClose={() => setCarToCancelReservation(null)} onConfirm={handleConfirmCancelReservation} />}
            {reservationSuccessData && <ReservationPdfModal car={reservationSuccessData} onClose={() => setReservationSuccessData(null)} />}

            {isAddUserModalOpen && <AddUserModal onClose={() => setAddUserModalOpen(false)} onUserAdded={handleUserAdded} />}
            {userToEdit && <EditUserModal user={userToEdit} onClose={() => setUserToEdit(null)} onUserUpdated={handleUserUpdated} />}
            {userToDelete && <DeleteUserConfirmationModal user={userToDelete} onClose={() => setUserToDelete(null)} onConfirmDelete={handleUserDeleted} />}

            <InvestmentDetailsModal isOpen={isInvestmentModalOpen} onClose={() => setInvestmentModalOpen(false)} cars={cars} expenses={allExpenses} />
            <RevenueDetailsModal isOpen={isRevenueModalOpen} onClose={() => setRevenueModalOpen(false)} cars={cars} />

            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            {carForGestoriaPickup && <GestoriaPickupModal car={carForGestoriaPickup} onClose={() => setCarForGestoriaPickup(null)} onConfirm={handleGestoriaPickup} />}
            {carForGestoriaReturn && <GestoriaReturnModal car={carForGestoriaReturn} onClose={() => setCarForGestoriaReturn(null)} onConfirm={handleGestoriaReturn} />}
            {carToNotify && <NotifyClientModal car={carToNotify} onClose={() => setCarToNotify(null)} />}
            {/* --- FIN DE LA MODIFICACIÓN --- */}
        </>
    );
};

export default AppModals;