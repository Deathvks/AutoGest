// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsActions.jsx
import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPencilAlt, faTrashAlt, faFileInvoiceDollar, faBan, faHandHoldingUsd,
    faBell, faExclamationTriangle, faFileInvoice
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CarDetailsActions = ({ car, onSellClick, onEditClick, onDeleteClick, onReserveClick, onCancelReservationClick, onAddExpenseClick, onAddIncidentClick }) => {
    const { user } = useContext(AuthContext);
    const isReservedAndActive = car.status.toUpperCase() === 'RESERVADO' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
    const isLockedForUser = isReservedAndActive && user.role !== 'admin';

    const handleGeneratePdf = (type) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString('es-ES');
        let buyer = {};
        if (car.buyerDetails) {
            try {
                buyer = typeof car.buyerDetails === 'string' ? JSON.parse(car.buyerDetails) : car.buyerDetails;
            } catch (e) {
                console.error("Error al parsear datos del comprador:", e);
            }
        }
        
        doc.setFontSize(18);
        doc.text(type === 'proforma' ? 'FACTURA PROFORMA' : 'FACTURA', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text("DATOS DEL VENDEDOR:", 14, 30);
        doc.text(`RAZÓN SOCIAL: ${user.businessName || user.name || ''}`, 14, 35);
        doc.text(`DNI/CIF: ${user.cif || user.dni || ''}`, 14, 40);
        doc.text(`DIRECCIÓN: ${user.address || ''}`, 14, 45);
        doc.text(`TELÉFONO: ${user.phone || ''}`, 14, 50);
        doc.text(`EMAIL: ${user.email || ''}`, 14, 55);

        doc.text("DATOS DEL COMPRADOR:", 105, 30);
        doc.text(`NOMBRE: ${buyer.name || ''} ${buyer.lastName || ''}`, 105, 35);
        doc.text(`DNI/NIE: ${buyer.dni || ''}`, 105, 40);
        doc.text(`TELÉFONO: ${buyer.phone || ''}`, 105, 45);
        doc.text(`EMAIL: ${buyer.email || ''}`, 105, 50);
        doc.text(`DIRECCIÓN: ${buyer.address || ''}`, 105, 55);

        doc.text("DETALLES:", 14, 65);
        doc.text(`FECHA: ${type === 'proforma' ? today : new Date(car.saleDate).toLocaleDateString('es-ES')}`, 14, 70);
        doc.text(`Nº FACTURA: ${type === 'proforma' ? `PROFORMA-${car.id}` : `${car.id}-${new Date(car.saleDate).getFullYear()}`}`, 14, 75);

        const price = parseFloat(car.salePrice || car.price);

        autoTable(doc, {
            startY: 85,
            head: [['CONCEPTO', 'TOTAL']],
            body: [[
                `VEHÍCULO ${car.make} ${car.model} CON MATRÍCULA ${car.licensePlate} Y BASTIDOR ${car.vin || ''}`,
                `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)}`
            ]],
            foot: [['', `TOTAL A PAGAR: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)}`]],
            theme: 'grid',
            footStyles: { halign: 'right' }
        });

        if (type === 'proforma') {
            const finalY = doc.lastAutoTable.finalY;
            doc.setFontSize(8);
            doc.text("ESTE DOCUMENTO NO TIENE VALIDEZ FISCAL. ES UN PRESUPUESTO PREVIO A LA FACTURA FINAL.", 105, finalY + 10, { align: 'center' });
        }
        
        doc.save(`${type}_${car.licensePlate}.pdf`);
    };

    return (
        <div className="flex-shrink-0 p-4 border-t border-border-color flex flex-wrap justify-center sm:justify-end gap-3">
            {car.status.toUpperCase() === 'VENDIDO' ? (
                // --- INICIO DE LA MODIFICACIÓN ---
                <button onClick={() => handleGeneratePdf('factura')} className="px-4 py-2 text-sm font-semibold text-white bg-green-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                {/* --- FIN DE LA MODIFICACIÓN --- */}
                    <FontAwesomeIcon icon={faFileInvoice} /> FACTURA
                </button>
            ) : (
                <button onClick={() => handleGeneratePdf('proforma')} className="px-4 py-2 text-sm font-semibold text-white bg-green-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFileInvoice} /> PROFORMA
                </button>
            )}
            
            <button disabled={isLockedForUser} onClick={() => onAddExpenseClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-accent rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <FontAwesomeIcon icon={faFileInvoiceDollar} /> AÑADIR GASTO
            </button>
            
            {car.status.toUpperCase() === 'VENDIDO' && (
                <button disabled={isLockedForUser} onClick={() => onAddIncidentClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> AÑADIR INCIDENCIA
                </button>
            )}
            
            {(car.status.toUpperCase() === 'EN VENTA' || car.status.toUpperCase() === 'RESERVADO') && (
                <button disabled={isLockedForUser} onClick={() => onSellClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FontAwesomeIcon icon={faHandHoldingUsd} /> VENDER
                </button>
            )}
            
            {car.status.toUpperCase() === 'EN VENTA' && (
                <button disabled={isLockedForUser} onClick={() => onReserveClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FontAwesomeIcon icon={faBell} /> RESERVAR
                </button>
            )}
            
            {car.status.toUpperCase() === 'RESERVADO' && (
                <button onClick={() => onCancelReservationClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-red-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBan} /> CANCELAR RESERVA
                </button>
            )}
            
            <button disabled={isLockedForUser} onClick={() => onEditClick(car)} className="px-4 py-2 text-sm font-semibold text-text-primary bg-component-bg-hover rounded-lg border border-border-color hover:bg-border-color flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <FontAwesomeIcon icon={faPencilAlt} /> EDITAR
            </button>
            
            <button disabled={isLockedForUser} onClick={() => onDeleteClick(car)} className="px-4 py-2 text-sm font-semibold text-red-accent bg-red-accent/10 rounded-lg hover:bg-red-accent/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <FontAwesomeIcon icon={faTrashAlt} /> ELIMINAR
            </button>
        </div>
    );
};

export default CarDetailsActions;