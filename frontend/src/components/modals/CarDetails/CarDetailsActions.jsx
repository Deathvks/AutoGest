// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsActions.jsx
import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPencilAlt, faTrashAlt, faFileInvoiceDollar, faBan, faHandHoldingUsd,
    faBell, faExclamationTriangle, faFileInvoice, faFileSignature
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import GeneratePdfModal from '../GeneratePdfModal';
import api from '../../../services/api';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

// --- INICIO DE LA MODIFICACIÓN ---
const CarDetailsActions = ({ car, onSellClick, onEditClick, onDeleteClick, onReserveClick, onCancelReservationClick, onAddExpenseClick, onAddIncidentClick, onUpdateCar, onTestDriveClick }) => {
// --- FIN DE LA MODIFICACIÓN ---
    const { user } = useContext(AuthContext);
    const isReservedAndActive = car.status.toUpperCase() === 'RESERVADO' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
    const isLockedForUser = isReservedAndActive && user.role !== 'admin';

    const [pdfModalInfo, setPdfModalInfo] = useState({ isOpen: false, type: '', number: 0 });

    const handleGeneratePdf = async (type, number) => {
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
            const logoUrl = `${API_BASE_URL}${user.logoUrl}`;
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
        
        const lightGreenColor = [219, 237, 213];

        doc.setFontSize(24);
        doc.text(type.toUpperCase(), 14, currentY);

        doc.setFontSize(10);
        doc.text(`Nº ${type.toUpperCase()}: ${type.toUpperCase()}-${number}`, 150, currentY);
        doc.text(`EMISIÓN: ${today}`, 150, currentY + 5);
        
        currentY += 25;

        doc.setFillColor(lightGreenColor[0], lightGreenColor[1], lightGreenColor[2]);
        doc.rect(14, currentY - 5, 85, 7, 'F');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('CLIENTE:', 16, currentY);

        doc.setFontSize(10);
        doc.text(`${buyer.name || '...........................................'} ${buyer.lastName || ''}`, 16, currentY + 10);
        doc.text(`${buyer.address || '...........................................'}`, 16, currentY + 15);
        doc.text(`${buyer.phone || '...........................................'}`, 16, currentY + 20);
        doc.text(`${buyer.email || '...........................................'}`, 16, currentY + 25);
        doc.text(`${buyer.dni || '...........................................'}`, 16, currentY + 30);

        doc.setFillColor(lightGreenColor[0], lightGreenColor[1], lightGreenColor[2]);
        doc.rect(105, currentY - 5, 91, 7, 'F');
        doc.setFontSize(11);
        doc.text('EN SIGNA:', 107, currentY);
        
        doc.setFontSize(10);
        if (user.cif) {
            doc.text(`${user.businessName || ''}`, 107, currentY + 10);
            doc.text(`${user.cif || ''}`, 107, currentY + 15);
        } else {
            doc.text(`${user.name || ''}`, 107, currentY + 10);
            doc.text(`${user.dni || ''}`, 107, currentY + 15);
        }
        doc.text(`${user.address || ''}`, 107, currentY + 20);
        doc.text(`${user.phone || ''}`, 107, currentY + 25);
        doc.text(`${user.email || ''}`, 107, currentY + 30);

        currentY += 45;
        
        const price = parseFloat(type === 'factura' ? car.salePrice : car.price);

        if (type === 'factura' && user.applyIgic) {
            const basePrice = price / 1.07;
            const igicAmount = price - basePrice;

            autoTable(doc, {
                startY: currentY,
                head: [['Descripción', 'Base Imponible', 'IGIC (7%)', 'TOTAL']],
                body: [[
                    `VEHÍCULO: ${car.make} ${car.model} (${car.licensePlate})`,
                    `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(basePrice)} €`,
                    `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(igicAmount)} €`,
                    `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)} €`
                ]],
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
                headStyles: { fillColor: lightGreenColor, textColor: 0, fontStyle: 'bold' },
                columnStyles: { 0: { cellWidth: 85 }, 1: { cellWidth: 30, halign: 'right' }, 2: { cellWidth: 30, halign: 'right' }, 3: { cellWidth: 35, halign: 'right' } }
            });

            const finalYTable = doc.lastAutoTable.finalY;
            doc.setFontSize(10);
            doc.text('SUBTOTAL:', 150, finalYTable + 10, { align: 'right' });
            doc.text(`${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(basePrice)} €`, 190, finalYTable + 10, { align: 'right' });
            doc.text('IGIC (7%):', 150, finalYTable + 15, { align: 'right' });
            doc.text(`${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(igicAmount)} €`, 190, finalYTable + 15, { align: 'right' });

            doc.setFontSize(12);
            doc.setFillColor(lightGreenColor[0], lightGreenColor[1], lightGreenColor[2]);
            doc.rect(140, finalYTable + 20, 55, 7, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text('TOTAL:', 145, finalYTable + 25);
            doc.text(`${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)} €`, 193, finalYTable + 25, { align: 'right' });
        } else {
            autoTable(doc, {
                startY: currentY,
                head: [['Descripción', 'TOTAL']],
                body: [[
                    `VEHÍCULO: ${car.make} ${car.model} (${car.licensePlate})`,
                    `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)} €`
                ]],
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
                headStyles: { fillColor: lightGreenColor, textColor: 0, fontStyle: 'bold' },
                columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 30, halign: 'right' } }
            });

            const finalYTable = doc.lastAutoTable.finalY;
            doc.setFontSize(12);
            doc.setFillColor(lightGreenColor[0], lightGreenColor[1], lightGreenColor[2]);
            doc.rect(140, finalYTable + 15, 55, 7, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text('TOTAL:', 145, finalYTable + 20);
            doc.text(`${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)} €`, 193, finalYTable + 20, { align: 'right' });
        }
        
        doc.setTextColor(0, 0, 0);
        if (type === 'proforma') {
            doc.setFontSize(8);
            doc.text("ESTE DOCUMENTO NO TIENE VALIDEZ FISCAL.", 105, doc.internal.pageSize.height - 10, { align: 'center' });
        }
        
        const fileName = `${type}_${number}_${car.licensePlate}.pdf`;
        doc.save(fileName);
        
        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('invoicePdf', pdfFile);

        await onUpdateCar(car.id, formData);
        
        setPdfModalInfo({ isOpen: false, type: '', number: 0 });
    };

    const openPdfModal = (type) => {
        const nextNumber = type === 'proforma' ? user.proformaCounter : user.invoiceCounter;
        setPdfModalInfo({ isOpen: true, type, number: nextNumber });
    };

    return (
        <>
            <div className="flex-shrink-0 p-4 border-t border-border-color flex flex-wrap justify-center sm:justify-end gap-3">
                {(car.status.toUpperCase() === 'EN VENTA') && (
                    // --- INICIO DE LA MODIFICACIÓN ---
                    <button onClick={() => onTestDriveClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-yellow-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileSignature} /> DOCUMENTO PRUEBA
                    </button>
                    // --- FIN DE LA MODIFICACIÓN ---
                )}

                {car.status.toUpperCase() === 'VENDIDO' ? (
                    <button onClick={() => openPdfModal('factura')} className="px-4 py-2 text-sm font-semibold text-white bg-green-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileInvoice} /> FACTURA
                    </button>
                ) : (
                    <button onClick={() => openPdfModal('proforma')} className="px-4 py-2 text-sm font-semibold text-white bg-green-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
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
            {pdfModalInfo.isOpen && (
                <GeneratePdfModal
                    isOpen={pdfModalInfo.isOpen}
                    onClose={() => setPdfModalInfo({ isOpen: false, type: '', number: 0 })}
                    onConfirm={handleGeneratePdf}
                    type={pdfModalInfo.type}
                    defaultNumber={pdfModalInfo.number}
                    car={car}
                />
            )}
        </>
    );
};

export default CarDetailsActions;