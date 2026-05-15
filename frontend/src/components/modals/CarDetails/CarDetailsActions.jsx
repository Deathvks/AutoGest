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
        className={`flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-medium rounded-[12px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        <FontAwesomeIcon icon={icon} />
        <span className="hidden sm:inline">{text}</span>
    </button>
);

const CarDetailsActions = ({ car, onSellClick, onEditClick, onDeleteClick, onReserveClick, onCancelReservationClick, onAddExpenseClick, onAddIncidentClick, onTestDriveClick, onGeneratePdfClick }) => {
    const { user } = useContext(AuthContext);
    const isReservedAndActive = car.status.toUpperCase() === 'RESERVADO' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
    const isLockedForUser = isReservedAndActive && user.role !== 'admin';

    // Estilos base para botones (blanco, borde gris claro, texto azul marino)
    const baseStyle = "bg-white border border-[#E5E7EB] text-[#06122A] hover:bg-[#F2F4F8]";

    // Estilo específico para eliminar (borde rojo suave)
    const deleteStyle = "bg-white border border-[#FEE2E2] text-[#DC2626] hover:bg-[#FEE2E2]";

    return (
        <div className="flex-shrink-0 p-5 border-t border-[#E5E7EB] flex flex-wrap justify-center sm:justify-end gap-3 bg-white">
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
                <ActionButton disabled={isLockedForUser} onClick={() => onSellClick(car)} icon={faHandHoldingUsd} text="Vender" className="bg-[#16A34A] border border-[#16A34A] text-white hover:bg-green-700" />
            )}

            {car.status.toUpperCase() === 'EN VENTA' && (
                <ActionButton disabled={isLockedForUser} onClick={() => onReserveClick(car)} icon={faBell} text="Reservar" className="bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-50" />
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