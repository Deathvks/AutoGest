// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsActions.jsx
import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPencilAlt, faTrashAlt, faFileInvoiceDollar, faBan, faHandHoldingUsd,
    faBell, faExclamationTriangle, faFileInvoice, faFileSignature
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';
// --- INICIO DE LA MODIFICACIÓN ---
// Se eliminan las importaciones de jsPDF que ya no se usan aquí.
// --- FIN DE LA MODIFICACIÓN ---

const ActionButton = ({ onClick, disabled, icon, text, colorClass, title }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }} // Prevent modal close on button click
        disabled={disabled}
        title={title || text}
        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${colorClass}`}
    >
        <FontAwesomeIcon icon={icon} />
        <span className="hidden sm:inline">{text}</span>
    </button>
);

// --- INICIO DE LA MODIFICACIÓN ---
// Se elimina el parámetro 'onUpdateCar' que ya no se usa para subir el PDF desde aquí.
const CarDetailsActions = ({ car, onSellClick, onEditClick, onDeleteClick, onReserveClick, onCancelReservationClick, onAddExpenseClick, onAddIncidentClick, onTestDriveClick, onGeneratePdfClick }) => {
// --- FIN DE LA MODIFICACIÓN ---
    const { user } = useContext(AuthContext);
    const isReservedAndActive = car.status.toUpperCase() === 'RESERVADO' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
    const isLockedForUser = isReservedAndActive && user.role !== 'admin';

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se elimina toda la función 'handleGeneratePdf' de este componente.
    // La lógica se moverá a un manejador central para ser llamada desde el modal.
    // --- FIN DE LA MODIFICACIÓN ---
    
    const buttonStyle = "bg-component-bg-hover text-text-primary hover:bg-border-color";

    return (
        <div className="flex-shrink-0 p-4 border-t border-border-color flex flex-wrap justify-center sm:justify-end gap-3 bg-component-bg/50">
            {car.status.toUpperCase() === 'EN VENTA' && (
                <ActionButton onClick={() => onTestDriveClick(car)} icon={faFileSignature} text="Prueba" colorClass={buttonStyle} />
            )}

            {car.status.toUpperCase() === 'VENDIDO' ? (
                <ActionButton onClick={() => onGeneratePdfClick(car, 'factura')} icon={faFileInvoice} text="Factura" colorClass={buttonStyle} />
            ) : (
                <ActionButton onClick={() => onGeneratePdfClick(car, 'proforma')} icon={faFileInvoice} text="Proforma" colorClass={buttonStyle} />
            )}
            
            <ActionButton disabled={isLockedForUser} onClick={() => onAddExpenseClick(car)} icon={faFileInvoiceDollar} text="Gasto" colorClass={buttonStyle} />
            
            {car.status.toUpperCase() === 'VENDIDO' && (
                <ActionButton disabled={isLockedForUser} onClick={() => onAddIncidentClick(car)} icon={faExclamationTriangle} text="Incidencia" colorClass={buttonStyle} />
            )}
            
            {(car.status.toUpperCase() === 'EN VENTA' || car.status.toUpperCase() === 'RESERVADO') && (
                <ActionButton disabled={isLockedForUser} onClick={() => onSellClick(car)} icon={faHandHoldingUsd} text="Vender" colorClass={buttonStyle} />
            )}
            
            {car.status.toUpperCase() === 'EN VENTA' && (
                <ActionButton disabled={isLockedForUser} onClick={() => onReserveClick(car)} icon={faBell} text="Reservar" colorClass={buttonStyle} />
            )}
            
            {car.status.toUpperCase() === 'RESERVADO' && (
                <ActionButton onClick={() => onCancelReservationClick(car)} icon={faBan} text="Cancelar" colorClass={buttonStyle} />
            )}
            
            <ActionButton disabled={isLockedForUser} onClick={() => onEditClick(car)} icon={faPencilAlt} text="Editar" colorClass={buttonStyle} />
            
            <ActionButton disabled={isLockedForUser} onClick={() => onDeleteClick(car)} icon={faTrashAlt} text="Eliminar" colorClass={buttonStyle} />
        </div>
    );
};

export default CarDetailsActions;