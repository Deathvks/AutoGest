// frontend/src/hooks/carHandlers/useCarPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useCarActions } from './useCarActions'; 

export const useCarPDF = ({ setCars, setLocations, modalState }) => {
    const { user } = useContext(AuthContext);
    
    const context = { setCars, setLocations, modalState };
    const { handleUpdateCar } = useCarActions(context);

    // --- INICIO DE LA MODIFICACIÓN ---
    const handleGeneratePdf = async (car, type, number, igicRate, observations, paymentMethod, clientData) => {
        const doc = new jsPDF();
        const today = new Date();
        const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

        // --- Estilos y Colores ---
        const primaryColor = '#1a1a1a';
        const secondaryColor = '#555555';
        const headerFooterText = '#ffffff';
        const tableHeaderBg = 'rgb(5, 5, 5)'; // Color más oscuro para la cabecera de la tabla

        // --- Degradado del Header ---
        const headerGradient = doc.context2d.createLinearGradient(0, 0, doc.internal.pageSize.getWidth(), 0);
        headerGradient.addColorStop(0, 'rgb(5, 5, 5)');
        headerGradient.addColorStop(0.33, 'rgb(39, 39, 39)');
        headerGradient.addColorStop(0.66, 'rgb(69, 69, 69)');
        headerGradient.addColorStop(1, 'rgb(95, 95, 95)');
        doc.context2d.fillStyle = headerGradient;
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 80, 'F');


        // --- Cabecera ---
        // Logo o "AutoGest"
        if (user.logoUrl) {
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

                    const maxW = 50, maxH = 25;
                    let imgWidth = img.width, imgHeight = img.height;
                    if (imgWidth > maxW) {
                        imgHeight = (maxW / imgWidth) * imgHeight;
                        imgWidth = maxW;
                    }
                    if (imgHeight > maxH) {
                        imgWidth = (maxH / imgHeight) * imgWidth;
                        imgHeight = maxH;
                    }
                    doc.addImage(logoData, 'PNG', 14, 25, imgWidth, imgHeight);
                }
            } catch (error) {
                console.error("Error al cargar el logo para el PDF:", error);
                doc.setFontSize(18);
                doc.setTextColor(headerFooterText);
                doc.text("AutoGest", 14, 35);
            }
        } else {
            doc.setFontSize(18);
            doc.setTextColor(headerFooterText);
            doc.text("AutoGest", 14, 35);
        }
        
        // Datos del vendedor (derecha)
        doc.setFontSize(9);
        doc.setTextColor(headerFooterText);
        doc.text(user.businessName || user.name, 200, 25, { align: 'right' });
        doc.text(user.cif || user.dni || '', 200, 30, { align: 'right' });
        doc.text(user.phone || '', 200, 35, { align: 'right' });
        doc.text(user.address || '', 200, 40, { align: 'right' });
        doc.text(user.email || '', 200, 45, { align: 'right' });

        let currentY = 95;

        // Título del documento (fuera del header)
        doc.setFontSize(28);
        doc.setTextColor(primaryColor);
        doc.setFont(undefined, 'bold');
        const title = type === 'proforma' ? 'FACTURA PROFORMA' : 'FACTURA';
        doc.text(title, 105, currentY, { align: 'center' });
        currentY += 5;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor);
        doc.text(today.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), 105, currentY, { align: 'center' });

        currentY += 20;

        // --- Datos Cliente y Factura ---
        doc.setFontSize(9);
        doc.setTextColor(primaryColor);

        const buyerName = clientData.businessName || `${clientData.name || ''} ${clientData.lastName || ''}`;
        const buyerId = clientData.cif || clientData.dni || '';
        
        doc.setFont(undefined, 'bold');
        doc.text(`FACTURA PARA:`, 14, currentY);
        doc.setFont(undefined, 'normal');
        doc.text(buyerName, 14, currentY + 5);
        if (buyerId) doc.text(buyerId, 14, currentY + 10);
        if (clientData.address) doc.text(clientData.address, 14, currentY + 15);
        if (clientData.phone) doc.text(clientData.phone, 14, currentY + 20);
        if (clientData.email) doc.text(clientData.email, 14, currentY + 25);
        
        doc.setFont(undefined, 'normal');
        doc.text(`NÚMERO:`, 120, currentY);
        doc.setFont(undefined, 'bold');
        doc.text(`${type.toUpperCase()}-${number}`, 150, currentY);

        doc.setFont(undefined, 'normal');
        doc.text(`FECHA:`, 120, currentY + 5);
        doc.setFont(undefined, 'bold');
        doc.text(today.toLocaleDateString('es-ES'), 150, currentY + 5);
        
        doc.setFont(undefined, 'normal');
        doc.text(`VENCIMIENTO:`, 120, currentY + 10);
        doc.setFont(undefined, 'bold');
        doc.text('En el recibo', 150, currentY + 10);

        currentY += 35;


        // --- Tabla de Conceptos ---
        const price = parseFloat(type === 'factura' ? car.salePrice : car.price) || 0;
        const formattedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
        const carDescription = `VEHÍCULO ${car.make} ${car.model}`;

        autoTable(doc, {
            startY: currentY,
            head: [['Descripción', 'Cantidad', 'Precio por unida', 'Importe']],
            body: [[carDescription, '1', formattedPrice, formattedPrice]],
            theme: 'striped',
            headStyles: { fillColor: tableHeaderBg, textColor: headerFooterText, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 3, textColor: primaryColor, lineColor: [221, 221, 221] },
            columnStyles: {
                0: { cellWidth: 90 },
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right', fontStyle: 'bold' }
            }
        });
        currentY = doc.lastAutoTable.finalY;

        // --- Totales ---
        let total = price;
        let subtotal = price;
        let igicAmount = 0;
        
        const rate = parseFloat(igicRate) || 0;
        if (rate > 0) {
           subtotal = price / (1 + rate / 100);
           igicAmount = price - subtotal;
        }

        const totalsData = [
            ['SUBTOTAL:', new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(subtotal)],
        ];
        
        if (igicAmount > 0) {
            totalsData.push([`IGIC (${igicRate}%):`, new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(igicAmount)]);
        }

        totalsData.push(
            ['TOTAL:', new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total)],
            ['PAGADA:', new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(0)],
        );

        autoTable(doc, {
            startY: currentY + 5,
            body: totalsData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2, textColor: primaryColor },
            columnStyles: { 0: { halign: 'right', fontStyle: 'bold' } , 1: { halign: 'right' }},
            tableWidth: 'wrap',
            margin: { left: 125 }
        });
        currentY = doc.lastAutoTable.finalY;

        // Total por pagar con degradado
        const footerGradient = doc.context2d.createLinearGradient(125, 0, 125 + 71, 0);
        footerGradient.addColorStop(0, 'rgb(5, 5, 5)');
        footerGradient.addColorStop(0.33, 'rgb(39, 39, 39)');
        footerGradient.addColorStop(0.66, 'rgb(69, 69, 69)');
        footerGradient.addColorStop(1, 'rgb(95, 95, 95)');
        doc.context2d.fillStyle = footerGradient;
        doc.rect(125, currentY + 1, 71, 10, 'F');
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        doc.setTextColor(headerFooterText);
        doc.text('TOTAL POR PAGAR', 130, currentY + 7.5);
        doc.text(new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total), 196, currentY + 7.5, { align: 'right' });
        
        let finalY = currentY + 20;

        // --- Métodos de pago y Comentarios ---
        doc.setTextColor(primaryColor);
        
        if (paymentMethod && paymentMethod.trim() !== '') {
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            doc.text('Métodos de pago', 14, finalY);
            finalY += 5;
            doc.setFont(undefined, 'normal');
            doc.text(paymentMethod, 14, finalY);
            finalY += 10;
        }
        
        if (user.applyIgic && type === 'factura') {
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            doc.text('Comentarios', 14, finalY);
            finalY += 5;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            const splitObservations = doc.splitTextToSize('Factura exenta de IVA "Operación con inversión del sujeto pasivo conforme al Art. 84 (Uno.2°) de la Ley 37/1992 de IVA"', 90);
            doc.text(splitObservations, 14, finalY);
            finalY += (splitObservations.length * 4) + 5;
        }

        if (observations && observations.trim() !== '') {
            if (!user.applyIgic || type !== 'factura') {
                doc.setFont(undefined, 'bold');
                doc.setFontSize(10);
                doc.text('Comentarios', 14, finalY);
                finalY += 5;
            }
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            const splitObservations = doc.splitTextToSize(observations, 182);
            doc.text(splitObservations, 14, finalY);
        }
        
        const fileName = `${type}_${number}_${car.licensePlate}.pdf`;
        doc.save(fileName);
        
        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('invoicePdf', pdfFile);
        
        await handleUpdateCar(car.id, formData);
    };
    // --- FIN DE LA MODIFICACIÓN ---

    return {
        handleGeneratePdf,
    };
};