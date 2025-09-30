// autogest-app/frontend/src/components/modals/CarDetailsModal.jsx
import React from 'react';
import CarDetailsModalContent from './CarDetailsModalContent';

const CarDetailsModal = ({ car, incidents, onClose, onSellClick, onEditClick, onDeleteClick, onReserveClick, onCancelReservationClick, onResolveIncident, onDeleteIncident, onDeleteNote, onAddExpenseClick, onEditExpenseClick, onDeleteExpense, onAddIncidentClick, onGestoriaPickupClick, onGestoriaReturnClick, onUpdateCar, onTestDriveClick }) => {
    if (!car) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <CarDetailsModalContent
                    car={car}
                    incidents={incidents}
                    onClose={onClose}
                    onSellClick={onSellClick}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onReserveClick={onReserveClick}
                    onCancelReservationClick={onCancelReservationClick}
                    onResolveIncident={onResolveIncident}
                    onDeleteIncident={onDeleteIncident}
                    onDeleteNote={onDeleteNote}
                    onAddExpenseClick={onAddExpenseClick}
                    onEditExpenseClick={onEditExpenseClick}
                    onDeleteExpense={onDeleteExpense}
                    onAddIncidentClick={onAddIncidentClick}
                    onGestoriaPickupClick={onGestoriaPickupClick}
                    onGestoriaReturnClick={onGestoriaReturnClick}
                    onUpdateCar={onUpdateCar}
                    onTestDriveClick={onTestDriveClick}
                />
            </div>
        </div>
    );
};

export default CarDetailsModal;