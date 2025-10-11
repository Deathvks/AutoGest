// frontend/src/hooks/carHandlers/useCarStatus.js
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const generateReservationPDF = (car, depositAmount) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("CONTRATO DE RESERVA DE VEHÍCULO", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("DATOS DEL CLIENTE", 14, 40);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);
    doc.text("Nombre y Apellidos:", 14, 50); doc.line(60, 50, 196, 50);
    doc.text("DNI/NIE:", 14, 60); doc.line(40, 60, 100, 60);
    doc.text("Firma:", 120, 60); doc.line(135, 60, 196, 60);
    doc.text("DATOS DEL VEHÍCULO", 14, 80);
    doc.line(14, 82, 196, 82);
    
    autoTable(doc, {
        startY: 85, theme: 'grid', headStyles: { fillColor: [41, 128, 185] },
        body: [
            ['Marca', car.make], ['Modelo', car.model], ['Matrícula', car.licensePlate],
            ['Nº de Bastidor (VIN)', car.vin || 'No especificado'],
            ['Precio de Venta', `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}`]
        ],
        styles: { fontSize: 10 }, columnStyles: { 0: { fontStyle: 'bold' } }
    });

    let finalY = doc.lastAutoTable.finalY;
    doc.text("CONDICIONES DE LA RESERVA", 14, finalY + 15);
    doc.line(14, finalY + 17, 196, finalY + 17);
    const legalText = `El cliente entrega la cantidad de ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(depositAmount)} en concepto de señal y reserva para el vehículo arriba referenciado. Esta cantidad constituye un compromiso de compra. En caso de que el cliente desista de la compra, esta cantidad no será devuelta, ya que el vehículo entra en un proceso de preparación para su posterior entrega, siendo retirado de la venta al público.`;
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(legalText, 182);
    doc.text(splitText, 14, finalY + 25);

    return doc.output('blob');
};


export const useCarStatus = ({ setCars, modalState }) => { // Se modifica la firma para aceptar un objeto

    const handleSellConfirm = async (carId, salePrice, saleDate, buyerDetails) => {
        try {
            const updatedData = { status: 'Vendido', salePrice, saleDate, buyerDetails: JSON.stringify(buyerDetails) };
            const updatedCar = await api.updateCar(carId, updatedData);
            setCars(prev => prev.map(c => c.id === carId ? updatedCar : c));
            modalState.setCarToSell(null);
        } catch (error) { console.error("Error al vender el coche:", error); }
    };

    const handleReserveConfirm = async (carToUpdate, newNoteContent, depositAmount, reservationDurationInHours, buyerDetails) => {
        try {
            const pdfBlob = generateReservationPDF(carToUpdate, depositAmount);
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