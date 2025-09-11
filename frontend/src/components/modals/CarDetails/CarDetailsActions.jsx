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
    const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
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
        doc.text(`Nombre: ${user.name}`, 14, 35);
        doc.text(`Email: ${user.email}`, 14, 40);

        doc.text("DATOS DEL COMPRADOR:", 105, 30);
        doc.text(`Nombre: ${buyer.name || ''} ${buyer.lastName || ''}`, 105, 35);
        doc.text(`DNI/NIE: ${buyer.dni || ''}`, 105, 40);
        doc.text(`Teléfono: ${buyer.phone || ''}`, 105, 45);
        doc.text(`Email: ${buyer.email || ''}`, 105, 50);

        doc.text("DETALLES:", 14, 60);
        doc.text(`Fecha: ${type === 'proforma' ? today : new Date(car.saleDate).toLocaleDateString('es-ES')}`, 14, 65);
        doc.text(`Nº Factura: ${type === 'proforma' ? `PROFORMA-${car.id}` : `${car.id}-${new Date(car.saleDate).getFullYear()}`}`, 14, 70);

        const price = parseFloat(car.salePrice || car.price);
        const base = price / 1.21;
        const iva = price - base;

        autoTable(doc, {
            startY: 80,
            head: [['Concepto', 'Base Imponible', 'IVA (21%)', 'Total']],
            body: [[
                `Vehículo ${car.make} ${car.model} con matrícula ${car.licensePlate} y bastidor ${car.vin || ''}`,
                `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(base)}`,
                `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(iva)}`,
                `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)}`
            ]],
            foot: [['', '', 'Total a pagar:', `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)}`]],
            theme: 'grid'
        });

        if (type === 'proforma') {
            const finalY = doc.lastAutoTable.finalY;
            doc.setFontSize(8);
            doc.text("Este documento no tiene validez fiscal. Es un presupuesto previo a la factura final.", 105, finalY + 10, { align: 'center' });
        }
        
        doc.save(`${type}_${car.licensePlate}.pdf`);
    };

    return (
        <div className="flex-shrink-0 p-4 border-t border-border-color flex flex-wrap justify-center sm:justify-end gap-3">
            {car.status === 'Vendido' ? (
                <button onClick={() => handleGeneratePdf('invoice')} className="px-4 py-2 text-sm font-semibold text-white bg-green-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFileInvoice} /> Factura
                </button>
            ) : (
                <button onClick={() => handleGeneratePdf('proforma')} className="px-4 py-2 text-sm font-semibold text-white bg-green-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFileInvoice} /> Proforma
                </button>
            )}
            
            <button disabled={isLockedForUser} onClick={() => onAddExpenseClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-accent rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <FontAwesomeIcon icon={faFileInvoiceDollar} /> Añadir Gasto
            </button>
            
            {car.status === 'Vendido' && (
                <button disabled={isLockedForUser} onClick={() => onAddIncidentClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> Añadir Incidencia
                </button>
            )}
            
            {(car.status === 'En venta' || car.status === 'Reservado') && (
                <button disabled={isLockedForUser} onClick={() => onSellClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FontAwesomeIcon icon={faHandHoldingUsd} /> Vender
                </button>
            )}
            
            {car.status === 'En venta' && (
                <button disabled={isLockedForUser} onClick={() => onReserveClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FontAwesomeIcon icon={faBell} /> Reservar
                </button>
            )}
            
            {car.status === 'Reservado' && (
                <button onClick={() => onCancelReservationClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-red-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBan} /> Cancelar Reserva
                </button>
            )}
            
            <button disabled={isLockedForUser} onClick={() => onEditClick(car)} className="px-4 py-2 text-sm font-semibold text-text-primary bg-component-bg-hover rounded-lg border border-border-color hover:bg-border-color flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <FontAwesomeIcon icon={faPencilAlt} /> Editar
            </button>
            
            <button disabled={isLockedForUser} onClick={() => onDeleteClick(car)} className="px-4 py-2 text-sm font-semibold text-red-accent bg-red-accent/10 rounded-lg hover:bg-red-accent/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <FontAwesomeIcon icon={faTrashAlt} /> Eliminar
            </button>
        </div>
    );
};

export default CarDetailsActions;