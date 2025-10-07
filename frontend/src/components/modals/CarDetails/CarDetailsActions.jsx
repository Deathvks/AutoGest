// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsActions.jsx
import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPencilAlt, faTrashAlt, faFileInvoiceDollar, faBan, faHandHoldingUsd,
    faBell, faExclamationTriangle, faFileInvoice, faFileSignature
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const CarDetailsActions = ({ car, onSellClick, onEditClick, onDeleteClick, onReserveClick, onCancelReservationClick, onAddExpenseClick, onAddIncidentClick, onUpdateCar, onTestDriveClick, onGeneratePdfClick }) => {
    const { user } = useContext(AuthContext);
    const isReservedAndActive = car.status.toUpperCase() === 'RESERVADO' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
    const isLockedForUser = isReservedAndActive && user.role !== 'admin';

    const handleGeneratePdf = async (type, number, igicRate) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString('es-ES');
        let currentY = 20;

        const getImageAsBase64 = async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) return null;
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error("Error al cargar la imagen para el PDF:", error);
                return null;
            }
        };

        if (user.logoUrl) {
            const logoUrl = user.logoUrl;
            const logoData = await getImageAsBase64(logoUrl);
            if (logoData) {
                const img = new Image();
                img.src = logoData;
                await new Promise(resolve => { img.onload = resolve; });

                const maxW = 50;
                const maxH = 25;
                const aspectRatio = img.width / img.height;
                let imgWidth = maxW;
                let imgHeight = imgWidth / aspectRatio;

                if (imgHeight > maxH) {
                    imgHeight = maxH;
                    imgWidth = imgHeight * aspectRatio;
                }
                doc.addImage(logoData, 'PNG', 14, 15, imgWidth, imgHeight);
                currentY = 15 + imgHeight + 15;
            }
        }

        let buyer = {};
        if (car.buyerDetails) {
            try {
                buyer = typeof car.buyerDetails === 'string' ? JSON.parse(car.buyerDetails) : car.buyerDetails;
            } catch (e) {
                console.error("Error al parsear datos del comprador:", e);
            }
        }
        
        const accentColor = [139, 92, 246];

        doc.setFontSize(24);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(type.toUpperCase(), 14, currentY);

        doc.setFontSize(10);
        doc.setTextColor(144, 140, 170);
        doc.text(`Nº ${type.toUpperCase()}: ${type.toUpperCase()}-${number}`, 200, currentY, { align: 'right' });
        doc.text(`EMISIÓN: ${today}`, 200, currentY + 5, { align: 'right' });
        
        currentY += 25;
        
        doc.setFontSize(11);
        doc.setTextColor(40, 37, 61);
        doc.text('CLIENTE:', 14, currentY);
        doc.text('EMISOR:', 110, currentY);

        doc.setLineWidth(0.2);
        doc.setDrawColor(228, 228, 231);
        doc.line(14, currentY + 2, 200, currentY + 2);
        
        currentY += 8;

        doc.setFontSize(10);
        doc.setTextColor(113, 113, 122);
        doc.text(`${buyer.name || ''} ${buyer.lastName || ''}`, 14, currentY);
        doc.text(`${user.cif ? user.businessName : user.name}`, 110, currentY);
        doc.text(`${buyer.dni || ''}`, 14, currentY + 5);
        doc.text(`${user.cif || user.dni}`, 110, currentY + 5);
        doc.text(`${buyer.address || ''}`, 14, currentY + 10);
        doc.text(`${user.address || ''}`, 110, currentY + 10);

        currentY += 25;
        
        const price = parseFloat(type === 'factura' ? car.salePrice : car.price);

        const tableHeadStyles = { fillColor: [238, 236, 247], textColor: [24, 24, 27], fontStyle: 'bold' };
        if (igicRate > 0 && type === 'factura') {
            const basePrice = price / (1 + igicRate / 100);
            const igicAmount = price - basePrice;

            autoTable(doc, {
                startY: currentY,
                head: [['Descripción', 'Base Imponible', `IGIC (${igicRate}%)`, 'Total']],
                body: [[
                    { content: `VEHÍCULO: ${car.make} ${car.model} (${car.licensePlate})`, styles: { cellWidth: 85 } },
                    { content: `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(basePrice)} €`, styles: { halign: 'right' } },
                    { content: `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(igicAmount)} €`, styles: { halign: 'right' } },
                    { content: `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)} €`, styles: { halign: 'right' } }
                ]],
                theme: 'grid', styles: { fontSize: 9 }, headStyles: tableHeadStyles
            });

        } else {
            autoTable(doc, {
                startY: currentY,
                head: [['Descripción', 'Total']],
                body: [[
                    `VEHÍCULO: ${car.make} ${car.model} (${car.licensePlate})`,
                    { content: `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)} €`, styles: { halign: 'right' } }
                ]],
                theme: 'grid', styles: { fontSize: 9 }, headStyles: tableHeadStyles,
            });
        }
        
        if (type === 'proforma') {
            doc.setFontSize(8);
            doc.setTextColor(113, 113, 122);
            doc.text("Este documento no tiene validez fiscal.", 105, doc.internal.pageSize.height - 10, { align: 'center' });
        }
        
        const fileName = `${type}_${number}_${car.licensePlate}.pdf`;
        doc.save(fileName);
        
        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('invoicePdf', pdfFile);

        await onUpdateCar(car.id, formData);
    };
    
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