// frontend/src/hooks/carHandlers/useCarPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useCarActions } from './useCarActions';

// --- CONFIGURACIÓN DE COLORES ---
const colors = {
    black: [0, 0, 0],
    white: [255, 255, 255],
    darkGrey: [40, 40, 40],
    mediumGrey: [100, 100, 100],
    lightGrey: [240, 240, 240],
    pending: [231, 76, 60] // Rojo
};

// --- FUNCIÓN DE DEGRADADO (INTACTA - Cúbica) ---
const drawHorizontalGradient = (doc, x, y, w, h, colorStartRGB, colorEndRGB) => {
    const steps = Math.ceil(w * 2);
    const stepWidth = w / steps;

    for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        // La potencia 3 mantiene el color de inicio (negro) más tiempo
        const adjustedRatio = Math.pow(ratio, 3);

        const r = Math.floor(colorStartRGB[0] + ((colorEndRGB[0] - colorStartRGB[0]) * adjustedRatio));
        const g = Math.floor(colorStartRGB[1] + ((colorEndRGB[1] - colorStartRGB[1]) * adjustedRatio));
        const b = Math.floor(colorStartRGB[2] + ((colorEndRGB[2] - colorStartRGB[2]) * adjustedRatio));

        doc.setFillColor(r, g, b);
        doc.rect(x + (i * stepWidth), y, stepWidth + 0.5, h, 'F');
    }
};

const formatCurrency = (val) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

export const useCarPDF = ({ setCars, setLocations, modalState }) => {
    const { user } = useContext(AuthContext);
    const context = { setCars, setLocations, modalState };
    const { handleUpdateCar } = useCarActions(context);

    const handleGeneratePdf = async (car, type, number, igicRate, observations, paymentMethod, clientData) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const headerHeight = 45;

        // --- CÁLCULOS FECHA ---
        let docDate = new Date();
        if ((type === 'factura' || type === 'invoice') && car.saleDate) {
            if (typeof car.saleDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(car.saleDate)) {
                const [year, month, day] = car.saleDate.split('-').map(Number);
                docDate = new Date(year, month - 1, day);
            } else {
                docDate = new Date(car.saleDate);
            }
        }

        // --- CÁLCULOS IMPORTES ---
        const totalAmount = parseFloat(type === 'factura' ? car.salePrice : car.price) || 0;
        const rate = parseFloat(igicRate) || 0;
        const hasIgic = rate > 0;

        let baseAmount = totalAmount;
        let igicAmount = 0;

        if (hasIgic) {
            baseAmount = totalAmount / (1 + rate / 100);
            igicAmount = totalAmount - baseAmount;
        }

        // --- 1. HEADER (Negro -> Gris [80, 80, 80]) ---
        drawHorizontalGradient(doc, 0, 0, pageWidth, headerHeight, [0, 0, 0], [80, 80, 80]);

        // A) LOGO
        const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';
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

                    const maxWidth = 60;
                    const maxHeight = 35;
                    let imgWidth = maxWidth;
                    let imgHeight = (img.height * imgWidth) / img.width;

                    if (imgHeight > maxHeight) {
                        imgHeight = maxHeight;
                        imgWidth = (img.width * imgHeight) / img.height;
                    }

                    const yLogo = (headerHeight - imgHeight) / 2;
                    doc.addImage(logoData, 'PNG', 14, yLogo, imgWidth, imgHeight);
                    imageLoaded = true;
                }
            } catch (error) {
                console.error("Error cargando logo PDF:", error);
            }
        }

        if (!imageLoaded) {
            doc.setFontSize(18);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text((user.businessName || user.name || 'MI EMPRESA').toUpperCase(), 14, 28);
        }

        // B) INFO EMPRESA (Derecha - Texto BLANCO)
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');

        const userAddressParts = [
            user.companyStreetAddress || user.personalStreetAddress,
            user.companyPostalCode || user.personalPostalCode,
            user.companyCity || user.personalCity,
            user.companyProvince || user.personalProvince
        ].filter(Boolean);
        const fullUserAddress = userAddressParts.join(', ');

        const companyLines = [
            user.businessName?.toUpperCase() || `${user.name} ${user.lastName || ''}`.toUpperCase(),
            (user.cif || user.dni) ? `CIF/NIF: ${user.cif || user.dni}` : null,
            fullUserAddress,
            user.companyPhone || user.personalPhone || user.phone,
            user.email
        ].filter(Boolean);

        let yCompanyInfo = 15;
        companyLines.forEach(line => {
            doc.text(line, pageWidth - 14, yCompanyInfo, { align: 'right' });
            yCompanyInfo += 5;
        });

        // --- 2. TÍTULO Y FECHA ---
        let yContent = headerHeight + 20;

        doc.setFontSize(32);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        const docTitle = type === 'proforma' ? 'PROFORMA' : 'FACTURA';
        doc.text(docTitle, pageWidth / 2, yContent, { align: 'center' });

        yContent += 10;
        const dateFormatted = format(docDate, 'MMM, d, yyyy', { locale: es }).toUpperCase();
        doc.setFontSize(12);
        doc.setTextColor(...colors.darkGrey);
        doc.setFont('helvetica', 'bold');
        doc.text(dateFormatted, pageWidth / 2, yContent, { align: 'center' });

        // --- 3. COLUMNAS DATOS ---
        const startYColumns = yContent + 20;

        // COLUMNA IZQUIERDA (CLIENTE)
        doc.setFontSize(10);
        doc.setTextColor(...colors.black);
        doc.setFont('helvetica', 'bold');
        doc.text("FACTURA PARA:", 14, startYColumns);

        let yClientData = startYColumns + 8;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const clientName = clientData.businessName || `${clientData.name} ${clientData.lastName}`;
        doc.text(clientName || 'Cliente Genérico', 14, yClientData);
        yClientData += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const clientAddressParts = [
            clientData.streetAddress,
            clientData.postalCode,
            clientData.city,
            clientData.province
        ].filter(Boolean);

        const clientDetails = [
            (clientData.cif || clientData.dni) ? `CIF/NIF: ${clientData.cif || clientData.dni}` : null,
            clientAddressParts.join(', '),
            clientData.phone ? `Tel: ${clientData.phone}` : null,
            clientData.email
        ].filter(Boolean);

        clientDetails.forEach(detail => {
            // Ajuste para direcciones largas
            const splitDetail = doc.splitTextToSize(detail, 80);
            doc.text(splitDetail, 14, yClientData);
            yClientData += (splitDetail.length * 5);
        });

        // COLUMNA DERECHA (DATOS FACTURA)
        let yRight = startYColumns;
        const invoiceData = [
            { label: "NÚMERO:", value: `${type === 'invoice' ? 'FACTURA' : type.toUpperCase()}-${number}` },
            { label: "FECHA:", value: format(docDate, 'dd/MM/yyyy', { locale: es }) },
            { label: "VENCIMIENTO:", value: "En el recibo" }
        ];

        invoiceData.forEach(item => {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colors.black);
            doc.text(item.label, pageWidth - 80, yRight);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.darkGrey);
            doc.text(item.value, pageWidth - 14, yRight, { align: 'right' });

            yRight += 6;
        });

        // --- 4. TABLA ---
        const tableStartY = Math.max(yClientData, yRight) + 15;
        const carDescription = `VEHÍCULO ${car.make} ${car.model} (${car.licensePlate})\nN/BASTIDOR: ${car.vin || 'No especificado'}`;

        const tableBody = [
            [
                carDescription,
                "1",
                formatCurrency(baseAmount),
                formatCurrency(baseAmount)
            ]
        ];

        autoTable(doc, {
            startY: tableStartY,
            head: [['DESCRIPCIÓN', 'CANT.', 'PRECIO', 'IMPORTE']],
            body: tableBody,
            theme: 'plain',
            styles: {
                fontSize: 10,
                cellPadding: 3,
                textColor: colors.darkGrey,
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { halign: 'center', cellWidth: 20 },
                2: { halign: 'right', cellWidth: 35 },
                3: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }
            },
            headStyles: {
                halign: 'right',
                valign: 'middle'
            },
            willDrawCell: (data) => {
                if (data.section === 'head') {
                    if (data.column.index === 0) {
                        // Degradado de cabecera de tabla
                        drawHorizontalGradient(
                            doc, 0, data.cell.y, pageWidth, data.cell.height,
                            [0, 0, 0], [80, 80, 80]
                        );
                    }
                    doc.setTextColor(255, 255, 255);
                }
            },
            didParseCell: (data) => {
                if (data.section === 'head' && data.column.index === 0) {
                    data.cell.styles.halign = 'left';
                }
                if (data.section === 'head' && data.column.index === 1) {
                    data.cell.styles.halign = 'center';
                }
            }
        });

        // --- 5. TOTALES ---
        let finalY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(10);
        doc.setTextColor(...colors.darkGrey);

        doc.text("BASE IMPONIBLE:", pageWidth - 80, finalY + 5);
        doc.text(formatCurrency(baseAmount), pageWidth - 14, finalY + 5, { align: 'right' });

        if (hasIgic) {
            doc.text(`IGIC (${rate}%):`, pageWidth - 80, finalY + 11);
            doc.text(formatCurrency(igicAmount), pageWidth - 14, finalY + 11, { align: 'right' });
        } else {
            doc.text("IGIC (0%):", pageWidth - 80, finalY + 11);
            doc.text("0,00 €", pageWidth - 14, finalY + 11, { align: 'right' });
        }

        const totalBarY = finalY + 18;
        const totalBarHeight = 10;
        const totalBarWidth = 80;
        const totalBarX = pageWidth - 14 - totalBarWidth;

        // Degradado barra totales
        drawHorizontalGradient(doc, totalBarX, totalBarY, totalBarWidth, totalBarHeight, [0, 0, 0], [80, 80, 80]);

        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');

        const textY = totalBarY + (totalBarHeight / 2);
        doc.text("TOTAL:", totalBarX + 5, textY, { baseline: 'middle' });
        doc.text(formatCurrency(totalAmount), pageWidth - 16, textY, { align: 'right', baseline: 'middle' });

        // --- EXTRAS: PAGO Y OBSERVACIONES (Debajo de totales, a la izquierda) ---
        let extrasY = finalY + 35;
        doc.setTextColor(...colors.black);

        if (paymentMethod && paymentMethod.trim()) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text("Método de pago:", 14, extrasY);
            doc.setFont('helvetica', 'normal');
            doc.text(paymentMethod, 45, extrasY);
            extrasY += 7;
        }

        if (observations && observations.trim()) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text("Observaciones:", 14, extrasY);
            extrasY += 5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const splitObs = doc.splitTextToSize(observations, pageWidth - 28);
            doc.text(splitObs, 14, extrasY);
        }

        // --- 6. PIE LEGAL ---
        doc.setFontSize(8);
        doc.setTextColor(...colors.darkGrey);
        doc.setFont('helvetica', 'normal');

        const legalText = type === 'proforma'
            ? "ESTE DOCUMENTO NO TIENE VALIDEZ FISCAL. ES UN PRESUPUESTO PREVIO A LA FACTURA FINAL."
            : (hasIgic
                ? "Operación sujeta a IGIC conforme a la normativa tributaria vigente."
                : "Operación exenta de IGIC con Inversión del Sujeto Pasivo conforme a normativa vigente."
            );

        const textWidth = doc.getTextWidth(legalText);
        doc.text(legalText, (pageWidth - textWidth) / 2, pageHeight - 15);

        // --- GUARDAR ---
        const fileNameType = type === 'invoice' ? 'factura' : type;
        const fileName = `${fileNameType}_${number}_${car.licensePlate}.pdf`;
        doc.save(fileName);

        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('invoicePdf', pdfFile);

        await handleUpdateCar(car.id, formData);
    };

    return { handleGeneratePdf };
};