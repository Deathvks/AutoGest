// frontend/src/hooks/carHandlers/useCarPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useCarActions } from './useCarActions'; 

export const useCarPDF = ({ setCars, setLocations, modalState }) => {
    const { user } = useContext(AuthContext);
    
    // Se pasa el objeto completo (setCars, setLocations, modalState) a useCarActions
    const context = { setCars, setLocations, modalState };
    const { handleUpdateCar } = useCarActions(context);

    const handleGeneratePdf = async (car, type, number, igicRate, observations) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString('es-ES');
        let currentY = 20;

        // Añadir logo si existe
        if (user.logoUrl) {
            const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';
            const logoUrl = `${API_BASE_URL}${user.logoUrl}`;
            try {
                const response = await fetch(logoUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    const logoData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    
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
                    currentY = 15 + imgHeight + 15; // Ajustar la posición Y inicial
                }
            } catch (error) {
                console.error("Error al cargar el logo para el PDF:", error);
            }
        }

        const title = type === 'proforma' ? 'FACTURA PROFORMA' : 'FACTURA';
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(title, 105, currentY, { align: 'center' });
        currentY += 20;

        const sellerX = 14;
        const buyerX = 110;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('DATOS DEL VENDEDOR:', sellerX, currentY);
        doc.text('DATOS DEL COMPRADOR:', buyerX, currentY);
        currentY += 6;

        let buyer = {};
        if (car.buyerDetails) {
            try {
                buyer = typeof car.buyerDetails === 'string' ? JSON.parse(car.buyerDetails) : car.buyerDetails;
            } catch (e) { console.error("Error parsing buyer data:", e); }
        }
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`NOMBRE Y APELLIDOS: ${user.cif ? user.businessName : user.name}`, sellerX, currentY);
        doc.text(`DNI / NIE: ${user.cif || user.dni || ''}`, sellerX, currentY + 5);
        doc.text(`DIRECCIÓN: ${user.address || ''}`, sellerX, currentY + 10);
        doc.text(`TELÉFONO: ${user.phone || ''}`, sellerX, currentY + 15);
        doc.text(`EMAIL: ${user.email}`, sellerX, currentY + 20);

        doc.text(`NOMBRE: ${buyer.name || ''} ${buyer.lastName || ''}`, buyerX, currentY);
        doc.text(`DNI/NIE: ${buyer.dni || ''}`, buyerX, currentY + 5);
        doc.text(`TELÉFONO: ${buyer.phone || ''}`, buyerX, currentY + 10);
        doc.text(`EMAIL: ${buyer.email || ''}`, buyerX, currentY + 15);
        doc.text(`DIRECCIÓN: ${buyer.address || ''}`, buyerX, currentY + 20);
        currentY += 30;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('DETALLES:', sellerX, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`FECHA: ${today}`, sellerX, currentY + 5);
        doc.text(`Nº FACTURA: ${type.toUpperCase()}-${number}`, sellerX, currentY + 10);
        currentY += 20;

        const tealColor = [0, 150, 136];
        const price = parseFloat(type === 'factura' ? car.salePrice : car.price) || 0;
        const formattedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
        const registrationYear = car.registrationDate ? new Date(car.registrationDate).getFullYear() : 'N/A';
        const carKm = car.km ? new Intl.NumberFormat('es-ES').format(car.km) : 'N/A';
        const carDescription = `VEHÍCULO ${car.make} ${car.model} (${registrationYear}) CON MATRÍCULA ${car.licensePlate}, BASTIDOR ${car.vin || ''} Y ${carKm} KM.`;

        if (type === 'factura' && igicRate > 0) {
            const basePrice = price / (1 + igicRate / 100);
            const igicAmount = price - basePrice;
            const formattedBasePrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(basePrice);
            const formattedIgicAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(igicAmount);

            autoTable(doc, {
                startY: currentY,
                head: [['CONCEPTO', 'BASE IMPONIBLE', `IGIC (${igicRate}%)`, 'TOTAL']],
                body: [[carDescription, formattedBasePrice, formattedIgicAmount, formattedPrice]],
                foot: [['', '', 'TOTAL A PAGAR:', formattedPrice]],
                theme: 'grid',
                headStyles: { fillColor: tealColor, textColor: [255, 255, 255], fontStyle: 'bold' },
                footStyles: { fillColor: tealColor, textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 3 },
            });
        } else {
            autoTable(doc, {
                startY: currentY,
                head: [['CONCEPTO', 'TOTAL']],
                body: [[carDescription, formattedPrice]],
                foot: [['', '', 'TOTAL A PAGAR:', formattedPrice]],
                theme: 'grid',
                headStyles: { fillColor: tealColor, textColor: [255, 255, 255], fontStyle: 'bold' },
                footStyles: { fillColor: tealColor, textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 3 },
                columnStyles: { 1: { halign: 'right' } },
            });
        }

        currentY = doc.lastAutoTable.finalY + 15;

        // --- INICIO DE LA MODIFICACIÓN ---
        if (observations && observations.trim() !== '') {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('OBSERVACIONES:', sellerX, currentY);
            currentY += 6;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const splitObservations = doc.splitTextToSize(observations, 182);
            doc.text(splitObservations, 14, currentY);
            currentY += (splitObservations.length * 5) + 5; // Ajustar el espacio después de las observaciones
        }
        // --- FIN DE LA MODIFICACIÓN ---

        if (type === 'proforma') {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text("ESTE DOCUMENTO NO TIENE VALIDEZ FISCAL. ES UN PRESUPUESTO PREVIO A LA FACTURA FINAL.", 105, currentY, { align: 'center' });
        }
        
        const fileName = `${type}_${number}_${car.licensePlate}.pdf`;
        doc.save(fileName);
        
        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('invoicePdf', pdfFile);
        
        await handleUpdateCar(car.id, formData);
    };

    return {
        handleGeneratePdf,
    };
};