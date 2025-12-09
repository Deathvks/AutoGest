// frontend/src/hooks/carHandlers/useCarStatus.js
import { useContext } from 'react';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthContext } from '../../context/AuthContext';

// --- INICIO DE LA MODIFICACIÓN ---
// Se añade buyerDetails como parámetro y se actualiza el contenido del PDF
const generateReservationPDF = (car, depositAmount, buyerDetails) => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('es-ES');
    let currentY = 20;

    doc.setFontSize(18);
    doc.text("CONTRATO DE RESERVA DE VEHÍCULO", 105, currentY, { align: 'center' });
    currentY += 10;
    doc.setFontSize(10);
    doc.text(`Fecha: ${today}`, 196, currentY, { align: 'right' });

    currentY += 15;

    doc.setFontSize(12);
    doc.text("DATOS DEL CLIENTE", 14, currentY);
    doc.setLineWidth(0.5);
    doc.line(14, currentY + 2, 196, currentY + 2);

    // Construir la dirección completa usando los nuevos campos si existen, o el genérico
    const addressParts = [
        buyerDetails.streetAddress,
        buyerDetails.postalCode,
        buyerDetails.city,
        buyerDetails.province
    ].filter(part => part && part.trim() !== '');

    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : (buyerDetails.address || 'No especificada');

    autoTable(doc, {
        startY: currentY + 5,
        theme: 'plain',
        body: [
            ['Nombre:', `${buyerDetails.name} ${buyerDetails.lastName}`],
            ['DNI/NIE:', buyerDetails.dni],
            ['Teléfono:', buyerDetails.phone || 'No especificado'],
            ['Email:', buyerDetails.email || 'No especificado'],
            ['Dirección:', fullAddress] // Dirección completa
        ],
        styles: { fontSize: 11 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    doc.text("DATOS DEL VEHÍCULO", 14, currentY);
    doc.line(14, currentY + 2, 196, currentY + 2);

    autoTable(doc, {
        startY: currentY + 5,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        body: [
            ['Marca', car.make || ''],
            ['Modelo', car.model || ''],
            ['Matrícula', car.licensePlate || ''],
            ['Nº de Bastidor (VIN)', car.vin || 'No especificado'],
            ['Precio de Venta', `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}`]
        ],
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold' } }
    });

    currentY = doc.lastAutoTable.finalY + 15; // Ajustado el espacio

    doc.setFontSize(12); // Tamaño ajustado
    doc.text("CONDICIONES DE LA RESERVA", 14, currentY);
    doc.line(14, currentY + 2, 196, currentY + 2);

    currentY += 8; // Ajustado el espacio

    // Texto legal actualizado para usar el nombre del cliente
    const legalText = `El cliente D./Dña. ${buyerDetails.name} ${buyerDetails.lastName}, con DNI/NIE ${buyerDetails.dni}, entrega la cantidad de ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(depositAmount)} en concepto de señal y reserva para el vehículo arriba referenciado. Esta cantidad constituye un compromiso de compra. En caso de que el cliente desista de la compra, esta cantidad no será devuelta, ya que el vehículo entra en un proceso de preparación para su posterior entrega, siendo retirado de la venta al público.`;
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(legalText, 182); // Ancho ajustado
    doc.text(splitText, 14, currentY);

    currentY += (splitText.length * 5) + 20; // Calcular la altura del texto y añadir espacio

    // Líneas de firma
    doc.text("Firma del Cliente:", 14, currentY);
    doc.line(55, currentY, 196, currentY); // Línea más larga

    return doc.output('blob');
};
// --- FIN DE LA MODIFICACIÓN ---


export const useCarStatus = ({ setCars, modalState }) => {
    const { user } = useContext(AuthContext);

    const handleSellConfirm = async (carId, salePrice, saleDate, buyerDetails) => {
        try {
            const updatedData = { status: 'Vendido', salePrice, saleDate, buyerDetails: JSON.stringify(buyerDetails) };
            const updatedCar = await api.updateCar(carId, updatedData);
            setCars(prev => prev.map(c => c.id === carId ? updatedCar : c));
            modalState.setCarToSell(null);

            // --- INICIO DE LA MODIFICACIÓN ---
            // Abrimos el modal de Factura automáticamente tras la venta
            if (user) {
                modalState.setPdfModalInfo({
                    car: updatedCar,
                    type: 'invoice', // Tipo factura por defecto al vender
                    number: user.invoiceCounter // Siguiente número de factura del usuario
                });
            }
            // --- FIN DE LA MODIFICACIÓN ---

        } catch (error) { console.error("Error al vender el coche:", error); }
    };

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se añade buyerDetails como parámetro para pasarlo a generateReservationPDF
    const handleReserveConfirm = async (carToUpdate, newNoteContent, depositAmount, reservationDurationInHours, buyerDetails) => {
        // --- FIN DE LA MODIFICACIÓN ---
        try {
            // --- INICIO DE LA MODIFICACIÓN ---
            // Se pasa buyerDetails a la función de generación de PDF
            const pdfBlob = generateReservationPDF(carToUpdate, depositAmount, buyerDetails);
            // --- FIN DE LA MODIFICACIÓN ---
            if (!pdfBlob) return;

            const formData = new FormData();

            let existingNotes = [];
            if (carToUpdate.notes) {
                try {
                    const parsed = JSON.parse(carToUpdate.notes);
                    if (Array.isArray(parsed)) existingNotes = parsed;
                } catch (e) {
                    existingNotes = [{ id: new Date(carToUpdate.updatedAt).getTime(), content: carToUpdate.notes, type: 'General', date: new Date(carToUpdate.updatedAt).toISOString().split('T')[0] }];
                }
            }
            if (newNoteContent?.trim()) {
                existingNotes.push({ id: Date.now(), content: newNoteContent, type: 'Reserva', date: new Date().toISOString().split('T')[0] });
            }

            formData.append('status', 'Reservado');
            formData.append('notes', JSON.stringify(existingNotes));
            formData.append('reservationDeposit', depositAmount);
            formData.append('reservationDuration', reservationDurationInHours);
            formData.append('reservationPdf', pdfBlob, `Reserva_${carToUpdate.licensePlate}.pdf`);
            formData.append('buyerDetails', JSON.stringify(buyerDetails));

            const updatedCar = await api.updateCar(carToUpdate.id, formData);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
            modalState.setCarToReserve(null);
            modalState.setReservationSuccessData(updatedCar);
        } catch (error) {
            console.error("Error al reservar el coche:", error);
        }
    };

    const handleConfirmCancelReservation = async (carToUpdate) => {
        try {
            let notes = [];
            if (carToUpdate.notes) {
                try {
                    const parsed = JSON.parse(carToUpdate.notes);
                    if (Array.isArray(parsed)) notes = parsed;
                } catch (e) { }
            }
            const updatedNotes = notes.filter(note => note.type !== 'Reserva');
            const updatedData = { status: 'En venta', reservationDeposit: null, notes: JSON.stringify(updatedNotes) };
            const updatedCar = await api.updateCar(carToUpdate.id, updatedData);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
            modalState.setCarToCancelReservation(null);
            if (modalState.carToView && modalState.carToView.id === updatedCar.id) {
                modalState.setCarToView(updatedCar);
            }
        } catch (error) { console.error("Error al cancelar la reserva:", error); }
    };

    const handleUpdateCarInsurance = async (car, hasInsurance) => {
        setCars(prev => prev.map(c => c.id === car.id ? { ...c, hasInsurance } : c));
        try {
            await api.updateCar(car.id, { hasInsurance });
        } catch (error) {
            console.error("Error al actualizar el seguro:", error);
            setCars(prev => prev.map(c => c.id === car.id ? { ...c, hasInsurance: !hasInsurance } : c));
        }
    };

    return {
        handleSellConfirm,
        handleReserveConfirm,
        handleConfirmCancelReservation,
        handleUpdateCarInsurance,
    };
};