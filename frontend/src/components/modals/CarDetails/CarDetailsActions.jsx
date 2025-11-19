// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsActions.jsx
import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPencilAlt, faTrashAlt, faFileInvoiceDollar, faBan, faHandHoldingUsd,
    faBell, faExclamationTriangle, faFileInvoice, faFileSignature
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';

const ActionButton = ({ onClick, disabled, icon, text, className, title }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        disabled={disabled}
        title={title || text}
        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded shadow-sm border transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${className}`}
    >
        <FontAwesomeIcon icon={icon} />
        <span className="hidden sm:inline">{text}</span>
    </button>
);

const CarDetailsActions = ({ car, onSellClick, onEditClick, onDeleteClick, onReserveClick, onCancelReservationClick, onAddExpenseClick, onAddIncidentClick, onTestDriveClick, onGeneratePdfClick }) => {
    const { user } = useContext(AuthContext);
    const isReservedAndActive = car.status.toUpperCase() === 'RESERVADO' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
    const isLockedForUser = isReservedAndActive && user.role !== 'admin';

    // Estilos base para botones (blanco, borde gris, texto gris oscuro)
    const baseStyle = "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-accent";
    
    // Estilo específico para eliminar (borde rojo suave)
    const deleteStyle = "bg-white border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200";

    return (
        <div className="flex-shrink-0 p-4 border-t border-gray-100 flex flex-wrap justify-center sm:justify-end gap-3 bg-gray-50">
            {car.status.toUpperCase() === 'EN VENTA' && (
                <ActionButton onClick={() => onTestDriveClick(car)} icon={faFileSignature} text="Prueba" className={baseStyle} />
            )}

            {car.status.toUpperCase() === 'VENDIDO' ? (
                <ActionButton onClick={() => onGeneratePdfClick(car, 'factura')} icon={faFileInvoice} text="Factura" className={baseStyle} />
            ) : (
                <ActionButton onClick={() => onGeneratePdfClick(car, 'proforma')} icon={faFileInvoice} text="Proforma" className={baseStyle} />
            )}
            
            <ActionButton disabled={isLockedForUser} onClick={() => onAddExpenseClick(car)} icon={faFileInvoiceDollar} text="Gasto" className={baseStyle} />
            
            {car.status.toUpperCase() === 'VENDIDO' && (
                <ActionButton disabled={isLockedForUser} onClick={() => onAddIncidentClick(car)} icon={faExclamationTriangle} text="Incidencia" className={baseStyle} />
            )}
            
            {(car.status.toUpperCase() === 'EN VENTA' || car.status.toUpperCase() === 'RESERVADO') && (
                <ActionButton disabled={isLockedForUser} onClick={() => onSellClick(car)} icon={faHandHoldingUsd} text="Vender" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300" />
            )}
            
            {car.status.toUpperCase() === 'EN VENTA' && (
                <ActionButton disabled={isLockedForUser} onClick={() => onReserveClick(car)} icon={faBell} text="Reservar" className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-300" />
            )}
            
            {car.status.toUpperCase() === 'RESERVADO' && (
                <ActionButton onClick={() => onCancelReservationClick(car)} icon={faBan} text="Cancelar" className={deleteStyle} />
            )}
            
            <ActionButton disabled={isLockedForUser} onClick={() => onEditClick(car)} icon={faPencilAlt} text="Editar" className={baseStyle} />
            
            <ActionButton disabled={isLockedForUser} onClick={() => onDeleteClick(car)} icon={faTrashAlt} text="Eliminar" className={deleteStyle} />
        </div>
    );
};

export default CarDetailsActions;