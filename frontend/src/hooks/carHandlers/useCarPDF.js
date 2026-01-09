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

    const handleGeneratePdf = async (car, type, number, igicRate, observations, paymentMethod, clientData) => {
        const doc = new jsPDF();

        // --- CAMBIO: Lógica para determinar la fecha del documento ---
        let docDate = new Date();

        // Si es una factura final y el coche tiene una fecha de venta registrada, usamos esa fecha.
        if ((type === 'factura' || type === 'invoice') && car.saleDate) {
            // Si el formato es YYYY-MM-DD (común en inputs tipo date), lo construimos localmente
            // para evitar que la conversión a UTC cambie el día.
            if (typeof car.saleDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(car.saleDate)) {
                const [year, month, day] = car.saleDate.split('-').map(Number);
                docDate = new Date(year, month - 1, day);
            } else {
                // Fallback para otros formatos (ISO string completo, objeto Date, etc.)
                docDate = new Date(car.saleDate);
            }
        }
        // --- FIN CAMBIO ---

        const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

        // --- Estilos y Colores ---
        const primaryColor = '#1a1a1a';
        const secondaryColor = '#555555';
        const headerFooterText = '#ffffff';
        const tableHeaderBg = 'rgb(5, 5, 5)';

        // --- Degradado del Header ---
        const headerGradient = doc.context2d.createLinearGradient(0, 0, doc.internal.pageSize.getWidth(), 0);
        headerGradient.addColorStop(0, 'rgb(5, 5, 5)');
        headerGradient.addColorStop(0.33, 'rgb(39, 39, 39)');
        headerGradient.addColorStop(0.66, 'rgb(69, 69, 69)');
        headerGradient.addColorStop(1, 'rgb(95, 95, 95)');
        doc.context2d.fillStyle = headerGradient;
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 80, 'F');

        // --- Cabecera ---
        const imageUrl = user.logoUrl || user.avatarUrl;
        let imageLoaded = false;

        if (imageUrl) {
            const fullImageUrl = `${API_BASE_URL}${imageUrl}`;
            try {
                const response = await fetch(fullImageUrl);
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
                    imageLoaded = true;
                }
            } catch (error) {
                console.error("Error al cargar la imagen para el PDF:", error);
            }
        }

        // --- INICIO DE LA DETECCIÓN AUTOMÁTICA ---
        // Detectar si es Particular o Profesional (Autónomo/Empresa)
        // Se considera profesional si tiene CIF o Razón Social definida.
        const isProfessional = !!(user.cif || user.businessName);

        if (!imageLoaded) {
            doc.setFontSize(18);
            doc.setTextColor(headerFooterText);

            if (user.businessName) {
                // Si tiene Razón Social (Empresa), la mostramos.
                doc.text(user.businessName, 14, 35);
            } else if (!isProfessional) {
                // Si es Particular (no tiene CIF ni Razón Social), mostramos Nombre y Apellidos.
                const fullName = `${user.name} ${user.lastName || ''}`.trim();
                doc.text(fullName, 14, 35);
            }
            // Si es Autónomo (tiene CIF pero no Razón Social) y no hay logo -> NO MOSTRAMOS NADA (Texto vacío)
        }
        // --- FIN DE LA DETECCIÓN AUTOMÁTICA ---

        const userAddressParts = [
            user.companyStreetAddress || user.personalStreetAddress,
            user.companyPostalCode || user.personalPostalCode,
            user.companyCity || user.personalCity,
            user.companyProvince || user.personalProvince
        ].filter(part => part && part.trim() !== '');

        const fullUserAddress = userAddressParts.length > 0 ? userAddressParts.join(', ') : (user.address || '');

        doc.setFontSize(9);
        doc.setTextColor(headerFooterText);

        // Datos de contacto a la derecha
        // Si es Particular -> Nombre personal.
        // Si es Profesional -> Razón Social si existe, si no Nombre personal.
        const rightSideName = (!isProfessional)
            ? `${user.name} ${user.lastName || ''}`.trim()
            : (user.businessName || `${user.name} ${user.lastName || ''}`.trim());

        doc.text(rightSideName, 200, 25, { align: 'right' });
        doc.text(user.cif || user.dni || '', 200, 30, { align: 'right' });

        const userPhone = user.companyPhone || user.personalPhone || user.phone || '';
        doc.text(userPhone, 200, 35, { align: 'right' });
        doc.text(fullUserAddress, 200, 40, { align: 'right' });
        doc.text(user.email || '', 200, 45, { align: 'right' });

        let currentY = 95;

        doc.setFontSize(28);
        doc.setTextColor(primaryColor);
        doc.setFont(undefined, 'bold');
        const title = type === 'proforma' ? 'FACTURA PROFORMA' : 'FACTURA';
        doc.text(title, 105, currentY, { align: 'center' });
        currentY += 5;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor);
        // CAMBIO: Usamos docDate en lugar de new Date()
        doc.text(docDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), 105, currentY, { align: 'center' });
        currentY += 20;

        doc.setFontSize(9);
        doc.setTextColor(primaryColor);

        const buyerName = clientData.businessName || `${clientData.name || ''} ${clientData.lastName || ''}`;
        const buyerId = clientData.cif || clientData.dni || '';

        const addressParts = [
            clientData.streetAddress,
            clientData.postalCode,
            clientData.city,
            clientData.province
        ].filter(part => part && part.trim() !== '');
        const fullAddress = addressParts.join(', ');

        doc.setFont(undefined, 'bold');
        doc.text(`FACTURA PARA:`, 14, currentY);
        doc.setFont(undefined, 'normal');

        let clientDetailsY = currentY + 5;
        doc.text(buyerName, 14, clientDetailsY);
        clientDetailsY += 5;

        if (buyerId) { doc.text(buyerId, 14, clientDetailsY); clientDetailsY += 5; }

        if (fullAddress) {
            const splitAddress = doc.splitTextToSize(fullAddress, 90);
            doc.text(splitAddress, 14, clientDetailsY);
            clientDetailsY += (splitAddress.length * 5);
        }

        if (clientData.phone) { doc.text(clientData.phone, 14, clientDetailsY); clientDetailsY += 5; }
        if (clientData.email) { doc.text(clientData.email, 14, clientDetailsY); }

        doc.setFont(undefined, 'normal');
        doc.text(`NÚMERO:`, 120, currentY);
        doc.setFont(undefined, 'bold');
        doc.text(`${type === 'invoice' ? 'FACTURA' : type.toUpperCase()}-${number}`, 150, currentY);

        doc.setFont(undefined, 'normal');
        doc.text(`FECHA:`, 120, currentY + 5);
        doc.setFont(undefined, 'bold');
        // CAMBIO: Usamos docDate en lugar de new Date()
        doc.text(docDate.toLocaleDateString('es-ES'), 150, currentY + 5);

        doc.setFont(undefined, 'normal');
        doc.text(`VENCIMIENTO:`, 120, currentY + 10);
        doc.setFont(undefined, 'bold');
        doc.text('En el recibo', 150, currentY + 10);
        currentY += 35;

        const price = parseFloat(type === 'factura' ? car.salePrice : car.price) || 0;
        const formattedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
        const carDescription = `VEHÍCULO ${car.make} ${car.model} (${car.licensePlate})\nN/BASTIDOR: ${car.vin || 'No especificado'}`;

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

        let total = price;
        let subtotal = price;
        let igicAmount = 0;

        const rate = parseFloat(igicRate) || 0;
        if (rate > 0) {
            subtotal = price / (1 + rate / 100);
            igicAmount = price - subtotal;
        }

        const paidAmount = type === 'factura' ? total : 0;

        const totalsData = [
            ['SUBTOTAL:', new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(subtotal)],
        ];

        if (igicAmount > 0) {
            totalsData.push([`IGIC (${igicRate}%):`, new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(igicAmount)]);
        }

        totalsData.push(
            ['TOTAL:', new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total)],
            ['PAGADA:', new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(paidAmount)],
        );

        autoTable(doc, {
            startY: currentY + 5,
            body: totalsData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2, textColor: primaryColor },
            columnStyles: { 0: { halign: 'right', fontStyle: 'bold' }, 1: { halign: 'right' } },
            tableWidth: 'wrap',
            margin: { left: 125 }
        });
        currentY = doc.lastAutoTable.finalY;

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

        if (type === 'proforma') {
            doc.text('TOTAL POR PAGAR', 130, currentY + 7.5);
            doc.text(new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total), 196, currentY + 7.5, { align: 'right' });
        } else {
            doc.text('TOTAL FACTURA', 130, currentY + 7.5);
            doc.text(new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total), 196, currentY + 7.5, { align: 'right' });
        }

        let finalY = currentY + 20;

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

        if (type === 'proforma') {
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.setFontSize(8);
            doc.setTextColor(secondaryColor);
            doc.setFont(undefined, 'italic');
            const proformaDisclaimer = "ESTE DOCUMENTO NO TIENE VALIDEZ FISCAL. ES UN PRESUPUESTO PREVIO A LA FACTURA FINAL";
            doc.text(proformaDisclaimer, 105, pageHeight - 10, { align: 'center' });
        }

        const fileNameType = type === 'invoice' ? 'factura' : type;
        const fileName = `${fileNameType}_${number}_${car.licensePlate}.pdf`;
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