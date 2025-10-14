// autogest-app/frontend/src/components/AppModals.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Importa todos los componentes de modales
import CarDetailsModal from './modals/CarDetailsModal';
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
import GestoriaPickupModal from './modals/GestoriaPickupModal';
import GestoriaReturnModal from './modals/GestoriaReturnModal';
import NotifyClientModal from './modals/NotifyClientModal';
import SubscriptionSuccessModal from './modals/SubscriptionSuccessModal';
import LogoutConfirmationModal from './modals/LogoutConfirmationModal';
import TestDriveModal from './modals/TestDriveModal';
import ExpelUserConfirmationModal from './modals/ExpelUserConfirmationModal';
import BusinessDataModal from './modals/BusinessDataModal';
import GeneratePdfModal from './modals/GeneratePdfModal';
import DeleteFileConfirmationModal from './modals/DeleteFileConfirmationModal';
// --- INICIO DE LA MODIFICACIÓN ---
import TrialModal from './modals/TrialModal';
// --- FIN DE LA MODIFICACIÓN ---

const AppModals = ({ appState }) => {
    const { logout, user, startTrial } = useContext(AuthContext);


    const {
        incidents, locations, allExpenses, cars, users,
        isAddUserModalOpen, setAddUserModalOpen, userToEdit, setUserToEdit,
        userToDelete, setUserToDelete, carToSell, setCarToSell,
        carToView, setCarToView, isAddCarModalOpen, setAddCarModalOpen,
        carForIncident, setCarForIncident, carToEdit, setCarToEdit,
        carToDelete, setCarToDelete, isAddExpenseModalOpen, setAddExpenseModalOpen,
        carForExpense, setCarForExpense, expenseToEdit, setExpenseToEdit,
        expenseToDelete, setExpenseToDelete, incidentToDelete, setIncidentToDelete,
        isDeleteAccountModalOpen, setIsDeleteAccountModalOpen, carToReserve, setCarToReserve,
        carToCancelReservation, setCarToCancelReservation, isInvestmentModalOpen, setInvestmentModalOpen,
        isRevenueModalOpen, setRevenueModalOpen, reservationSuccessData, setReservationSuccessData,
        carForGestoriaPickup, setCarForGestoriaPickup, carForGestoriaReturn, setCarForGestoriaReturn,
        carToNotify, setCarToNotify, isBusinessDataModalOpen, setIsBusinessDataModalOpen,
        isSubscriptionSuccessModalOpen, setSubscriptionSuccessModalOpen,
        isLogoutModalOpen, setLogoutModalOpen,
        carForTestDrive, setCarForTestDrive,
        userToExpel, setUserToExpel,
        pdfModalInfo, setPdfModalInfo,
        fileToDelete, setFileToDelete,
        // --- INICIO DE LA MODIFICACIÓN ---
        isTrialModalOpen, setIsTrialModalOpen,
        // --- FIN DE LA MODIFICACIÓN ---
        handleSaveBusinessData, handleUserAdded, handleUserUpdated,
        handleUserDeleted, handleExpelUser, handleAddCar, handleUpdateCar,
        handleDeleteCar, handleSellConfirm, handleReserveConfirm,
        handleConfirmCancelReservation, handleDeleteNote, handleAddIncident,
        handleDeleteIncident, confirmDeleteIncident, handleResolveIncident,
        handleAddExpense, handleUpdateExpense, confirmDeleteExpense,
        handleGestoriaPickup, handleGestoriaReturn,
        handleGeneratePdf,
        handleDeleteFile,
    } = appState;

    return (
        <>
            <CarDetailsModal
                car={carToView}
                incidents={carToView ? incidents.filter(inc => inc.carId === carToView.id) : []}
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
                onGestoriaPickupClick={(car) => { setCarToView(null); setCarForGestoriaPickup(car); }}
                onGestoriaReturnClick={(car) => { setCarToView(null); setCarForGestoriaReturn(car); }}
                onUpdateCar={handleUpdateCar}
                onTestDriveClick={(car) => { setCarToView(null); setCarForTestDrive(car); }}
                onGeneratePdfClick={(car, type) => {
                    const nextNumber = type === 'proforma' ? user.proformaCounter : user.invoiceCounter;
                    setPdfModalInfo({ car, type, number: nextNumber });
                    setCarToView(null);
                }}
                onDeleteFile={setFileToDelete}
            />
            
            {isAddCarModalOpen && <AddCarModal onClose={() => setAddCarModalOpen(false)} onAdd={handleAddCar} locations={locations} />}
            {carToEdit && <EditCarModal car={carToEdit} onClose={() => setCarToEdit(null)} onUpdate={(formData) => handleUpdateCar(carToEdit.id, formData)} locations={locations} />}
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
            {userToEdit && <EditUserModal user={userToEdit} onClose={() => setUserToEdit(null)} onUserUpdated={handleUserUpdated} onExpelUser={setUserToExpel} />}
            {userToDelete && <DeleteUserConfirmationModal user={userToDelete} onClose={() => setUserToDelete(null)} onConfirmDelete={handleUserDeleted} />}
            
            {userToExpel && <ExpelUserConfirmationModal user={userToExpel} onClose={() => setUserToExpel(null)} onConfirmExpel={handleExpelUser} />}

            <InvestmentDetailsModal isOpen={isInvestmentModalOpen} onClose={() => setInvestmentModalOpen(false)} cars={cars} expenses={allExpenses} />
            <RevenueDetailsModal isOpen={isRevenueModalOpen} onClose={() => setRevenueModalOpen(false)} cars={cars} />

            {carForGestoriaPickup && <GestoriaPickupModal car={carForGestoriaPickup} onClose={() => setCarForGestoriaPickup(null)} onConfirm={handleGestoriaPickup} />}
            {carForGestoriaReturn && <GestoriaReturnModal car={carForGestoriaReturn} onClose={() => setCarForGestoriaReturn(null)} onConfirm={handleGestoriaReturn} />}
            {carToNotify && <NotifyClientModal car={carToNotify} onClose={() => setCarToNotify(null)} />}
            
            <BusinessDataModal 
                isOpen={isBusinessDataModalOpen} 
                onClose={() => setIsBusinessDataModalOpen(false)} 
                onSave={handleSaveBusinessData} 
            />
            
            <SubscriptionSuccessModal 
                isOpen={isSubscriptionSuccessModalOpen}
                onClose={() => setSubscriptionSuccessModalOpen(false)}
            />
            <LogoutConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={logout}
            />
            {carForTestDrive && <TestDriveModal car={carForTestDrive} onClose={() => setCarForTestDrive(null)} />}

            {pdfModalInfo && (
                <GeneratePdfModal
                    isOpen={!!pdfModalInfo}
                    onClose={() => setPdfModalInfo(null)}
                    onConfirm={async (type, number, igicRate, observations) => {
                        await handleGeneratePdf(pdfModalInfo.car, type, number, igicRate, observations);
                        setPdfModalInfo(null);
                    }}
                    type={pdfModalInfo.type}
                    defaultNumber={pdfModalInfo.number}
                    car={pdfModalInfo.car}
                />
            )}
            
            {fileToDelete && (
                <DeleteFileConfirmationModal
                    fileData={fileToDelete}
                    onClose={() => setFileToDelete(null)}
                    onConfirm={handleDeleteFile}
                />
            )}

            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            <TrialModal
                isOpen={isTrialModalOpen}
                onClose={() => setIsTrialModalOpen(false)}
                onConfirm={startTrial}
            />
            {/* --- FIN DE LA MODIFICACIÓN --- */}
        </>
    );
};

export default AppModals;