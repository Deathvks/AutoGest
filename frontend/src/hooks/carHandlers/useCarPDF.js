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

        // --- Estilos y Colores ---
        const primaryColor = '#1a1a1a'; // Casi negro para títulos
        const secondaryColor = '#555555'; // Gris para texto normal
        const headerFooterBg = '#1a1a1a';
        const headerFooterText = '#ffffff';

        // --- Fuentes (Asegúrate de que estas fuentes estén disponibles o cámbialas por fuentes estándar)
        doc.addFont('js/libs/helvetica/Helvetica.ttf', 'Helvetica', 'normal');
        doc.addFont('js/libs/helvetica/Helvetica-Bold.ttf', 'Helvetica', 'bold');

        // --- Cabecera ---
        let currentY = 20;

        // Logo (si existe)
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
                }
            } catch (error) {
                console.error("Error al cargar el logo para el PDF:", error);
            }
        }
        
        // Datos del vendedor (derecha)
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(secondaryColor);
        doc.text(user.businessName || user.name, 200, 15, { align: 'right' });
        doc.text(user.cif || user.dni || '', 200, 20, { align: 'right' });
        doc.text(user.phone || '', 200, 25, { align: 'right' });
        doc.text(user.address || '', 200, 30, { align: 'right' });
        doc.text(user.email || '', 200, 35, { align: 'right' });

        currentY = 55;

        // --- Título de la Factura ---
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(primaryColor);
        const title = type === 'proforma' ? 'FACTURA PROFORMA' : 'FACTURA';
        doc.text(title, 105, currentY, { align: 'center' });
        currentY += 5;
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor);
        doc.text(today.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), 105, currentY, { align: 'center' });

        currentY += 20;

        // --- Datos Cliente y Factura ---
        const sellerX = 14;
        const buyerX = 120;

        doc.setFontSize(9);
        doc.setTextColor(primaryColor);

        const buyerName = clientData.businessName || `${clientData.name || ''} ${clientData.lastName || ''}`;
        const buyerId = clientData.cif || clientData.dni || '';

        doc.text(`FACTURA PARA: ${buyerName}`, sellerX, currentY);
        doc.text(`NÚMERO:`, buyerX, currentY);
        doc.setFont('Helvetica', 'bold');
        doc.text(`${type.toUpperCase()}-${number}`, buyerX + 25, currentY);
        currentY += 5;

        doc.setFont('Helvetica', 'normal');
        doc.text(buyerId, sellerX, currentY);
        doc.text(`FECHA:`, buyerX, currentY);
        doc.setFont('Helvetica', 'bold');
        doc.text(today.toLocaleDateString('es-ES'), buyerX + 25, currentY);
        currentY += 5;
        
        doc.setFont('Helvetica', 'normal');
        doc.text(clientData.address || '', sellerX, currentY);
        doc.text(`VENCIMIENTO:`, buyerX, currentY);
        doc.setFont('Helvetica', 'bold');
        doc.text('En el recibo', buyerX + 25, currentY);
        currentY += 5;

        doc.setFont('Helvetica', 'normal');
        doc.text(clientData.phone || '', sellerX, currentY);
        currentY += 5;
        doc.text(clientData.email || '', sellerX, currentY);
        currentY += 15;


        // --- Tabla de Conceptos ---
        const price = parseFloat(type === 'factura' ? car.salePrice : car.price) || 0;
        const formattedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
        const carDescription = `VEHÍCULO ${car.make} ${car.model}`;

        autoTable(doc, {
            startY: currentY,
            head: [['Descripción', 'Cantidad', 'Precio por unida', 'Importe']],
            body: [[carDescription, '1', formattedPrice, formattedPrice]],
            theme: 'plain',
            headStyles: { fillColor: headerFooterBg, textColor: headerFooterText, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 3 },
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

        if (type === 'factura' && igicRate > 0) {
            subtotal = price / (1 + igicRate / 100);
            igicAmount = price - subtotal;
        }

        const totalsData = [
            ['SUBTOTAL:', new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(subtotal)],
            ['TOTAL:', new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total)],
            ['PAGADA:', new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(0)],
        ];

        autoTable(doc, {
            startY: currentY + 2,
            body: totalsData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { halign: 'right', fontStyle: 'bold' } , 1: { halign: 'right' }},
            tableWidth: 'wrap',
            margin: { left: 125 }
        });
        currentY = doc.lastAutoTable.finalY;

        // Total por pagar
        doc.setFillColor(headerFooterBg);
        doc.rect(125, currentY + 1, 71, 10, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(headerFooterText);
        doc.text('TOTAL POR PAGAR', 130, currentY + 7.5);
        doc.text(new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total), 196, currentY + 7.5, { align: 'right' });
        
        currentY += 20;

        // --- Métodos de pago y Comentarios ---
        doc.setTextColor(primaryColor);
        
        if (paymentMethod && paymentMethod.trim() !== '') {
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('Métodos de pago', sellerX, currentY);
            currentY += 5;
            doc.setFont('Helvetica', 'normal');
            doc.text(paymentMethod, sellerX, currentY);
            currentY += 10;
        }

        if (observations && observations.trim() !== '') {
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('Comentarios', sellerX, currentY);
            currentY += 5;
            doc.setFont('Helvetica', 'normal');
            const splitObservations = doc.splitTextToSize(observations, 182);
            doc.text(splitObservations, sellerX, currentY);
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