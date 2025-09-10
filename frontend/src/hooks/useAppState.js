// autogest-app/frontend/src/hooks/useAppState.js
import { useState, useEffect, useRef, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const useAppState = () => {
    const { user } = useContext(AuthContext);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [cars, setCars] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [locations, setLocations] = useState([]);
    const [users, setUsers] = useState([]);

    // Estados de los modales
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [carToSell, setCarToSell] = useState(null);
    const [carToView, setCarToView] = useState(null);
    const [isAddCarModalOpen, setAddCarModalOpen] = useState(false);
    const [carForIncident, setCarForIncident] = useState(null);
    const [carToEdit, setCarToEdit] = useState(null);
    const [carToDelete, setCarToDelete] = useState(null);
    const [isAddExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
    const [carForExpense, setCarForExpense] = useState(null);
    const [expenseToEdit, setExpenseToEdit] = useState(null);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [incidentToDelete, setIncidentToDelete] = useState(null);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    const [carToReserve, setCarToReserve] = useState(null);
    const [carToCancelReservation, setCarToCancelReservation] = useState(null);
    const [isInvestmentModalOpen, setInvestmentModalOpen] = useState(false);
    const [isRevenueModalOpen, setRevenueModalOpen] = useState(false);
    const [reservationSuccessData, setReservationSuccessData] = useState(null);
    
    // --- INICIO DE LA MODIFICACIÓN ---
    const [carForGestoriaPickup, setCarForGestoriaPickup] = useState(null);
    const [carForGestoriaReturn, setCarForGestoriaReturn] = useState(null);
    const [carToNotify, setCarToNotify] = useState(null);
    // --- FIN DE LA MODIFICACIÓN ---

    // Estado del Toast y borrado pendiente
    const [toast, setToast] = useState(null);
    const [carPendingDeletion, setCarPendingDeletion] = useState(null);
    const deleteTimeoutRef = useRef(null);

    const fetchLocations = async () => {
        try {
            const locationsData = await api.getLocations();
            setLocations(locationsData);
        } catch (error) { console.error("Error al cargar ubicaciones:", error); }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsDataLoading(true);
            try {
                const dataPromises = [
                    api.getCars(),
                    api.getExpenses(),
                    api.getAllUserExpenses(),
                    api.getIncidents(),
                    api.getLocations(),
                ];
                if (user && user.role === 'admin') {
                    dataPromises.push(api.admin.getAllUsers());
                }
                const [carsData, expensesData, allExpensesData, incidentsData, locationsData, usersData] = await Promise.all(dataPromises);
                setCars(carsData);
                setExpenses(expensesData);
                setAllExpenses(allExpensesData);
                setIncidents(incidentsData);
                setLocations(locationsData);
                if (usersData) setUsers(usersData);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setIsDataLoading(false);
            }
        };
        fetchData();
    }, [user]);

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

    const handleUserAdded = (newUser) => { setUsers(prev => [newUser, ...prev]); setAddUserModalOpen(false); };
    const handleUserUpdated = (updatedUser) => { setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u)); setUserToEdit(null); };
    const handleUserDeleted = async (userId) => {
        try {
            await api.admin.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            setUserToDelete(null);
        } catch (error) { console.error("Error al eliminar usuario:", error); }
    };

    const handleAddCar = async (formData) => {
        try {
            const createdCar = await api.createCar(formData);
            setCars(prev => [createdCar, ...prev]);
            await fetchLocations();
            setAddCarModalOpen(false);
        } catch (error) { console.error("Error al añadir coche:", error); throw error; }
    };
    
    const handleUpdateCar = async (formData) => {
        try {
            const carId = carToEdit.id;
            const updatedCar = await api.updateCar(carId, formData);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
            await fetchLocations();
            setCarToEdit(null);
        } catch (error) { console.error("Error al actualizar coche:", error); throw error; }
    };
    
    const confirmDelete = async (carId) => {
        try {
            await api.deleteCar(carId);
            setCarPendingDeletion(null);
        } catch (error) {
            console.error("Error al eliminar coche:", error);
            if (carPendingDeletion) {
                setCars(prev => [carPendingDeletion, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }
        }
    };
    
    const handleDeleteCar = (carId) => {
        const car = cars.find(c => c.id === carId);
        if (!car) return;
        if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
        if (carPendingDeletion) confirmDelete(carPendingDeletion.id);
        setCars(prev => prev.filter(c => c.id !== carId));
        setCarPendingDeletion(car);
        setCarToDelete(null);
        setCarToView(null);
        setToast({ message: 'Coche eliminado.' });
        deleteTimeoutRef.current = setTimeout(() => {
            confirmDelete(carId);
            setToast(null);
            deleteTimeoutRef.current = null;
        }, 5000);
    };

    const handleUndoDelete = () => {
        if (deleteTimeoutRef.current) {
            clearTimeout(deleteTimeoutRef.current);
            deleteTimeoutRef.current = null;
        }
        if (carPendingDeletion) {
            setCars(prev => [carPendingDeletion, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setCarPendingDeletion(null);
        }
        setToast(null);
    };

    const handleSellConfirm = async (carId, salePrice, saleDate, buyerDetails) => {
        try {
            const updatedData = { status: 'Vendido', salePrice, saleDate, buyerDetails: JSON.stringify(buyerDetails) };
            const updatedCar = await api.updateCar(carId, updatedData);
            setCars(prev => prev.map(c => c.id === carId ? updatedCar : c));
            setCarToSell(null);
        } catch (error) { console.error("Error al vender el coche:", error); }
    };

    const handleReserveConfirm = async (carToUpdate, newNoteContent, depositAmount, reservationDurationInHours) => {
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

            const updatedCar = await api.updateCar(carToUpdate.id, formData);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
            setCarToReserve(null);
            setReservationSuccessData(updatedCar);
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
            setCarToCancelReservation(null);
            if (carToView && carToView.id === updatedCar.id) {
                setCarToView(updatedCar);
            }
        } catch (error) { console.error("Error al cancelar la reserva:", error); }
    };

    const handleUpdateCarInsurance = async (car, hasInsurance) => {
        const originalCars = [...cars];
        setCars(prev => prev.map(c => c.id === car.id ? { ...c, hasInsurance } : c));
        try {
            await api.updateCar(car.id, { hasInsurance });
        } catch (error) {
            console.error("Error al actualizar el seguro:", error);
            setCars(originalCars);
        }
    };

    const handleDeleteNote = async (car, noteIdToDelete) => {
        try {
            let notes = [];
            if (car.notes) {
                try {
                    const parsed = JSON.parse(car.notes);
                    if (Array.isArray(parsed)) notes = parsed;
                } catch (e) { }
            }
            const updatedNotes = notes.filter(note => note.id !== noteIdToDelete);
            const updatedCarData = await api.updateCar(car.id, { notes: JSON.stringify(updatedNotes) });
            setCars(prev => prev.map(c => (c.id === updatedCarData.id ? updatedCarData : c)));
            setCarToView({ ...updatedCarData });
        } catch (error) { console.error("Error al eliminar la nota:", error); }
    };

    const handleAddIncident = async (car, description) => {
        const incidentData = { date: new Date().toISOString().split('T')[0], description, licensePlate: car.licensePlate, carId: car.id };
        try {
            const newIncident = await api.createIncident(incidentData);
            setIncidents(prev => [newIncident, ...prev]);
            setCarForIncident(null);
        } catch (error) { console.error("Error al añadir incidencia:", error); }
    };

    const handleDeleteIncident = (incidentId) => setIncidentToDelete(incidents.find(inc => inc.id === incidentId));
    
    const confirmDeleteIncident = async (incidentId) => {
        try {
            await api.deleteIncident(incidentId);
            setIncidents(prev => prev.filter(inc => inc.id !== incidentId));
        } catch (error) { console.error("Error al eliminar incidencia:", error); } 
        finally { setIncidentToDelete(null); }
    };

    const handleResolveIncident = async (incidentId, newStatus) => {
        try {
            const updatedIncident = await api.updateIncident(incidentId, { status: newStatus });
            setIncidents(prev => prev.map(inc => inc.id === incidentId ? updatedIncident : inc));
        } catch (error) { console.error("Error al resolver incidencia:", error); }
    };

    const handleAddExpense = async (expenseData) => {
        try {
            const newExpense = await api.createExpense(expenseData);
            if (!expenseData.has('carLicensePlate')) {
                setExpenses(prev => [newExpense, ...prev]);
            }
            setAllExpenses(prev => [newExpense, ...prev]);
            setAddExpenseModalOpen(false);
            setCarForExpense(null);
            if (carToView) setCarToView(prev => ({ ...prev }));
        } catch (error) { console.error("Error al añadir gasto:", error); throw error; }
    };

    const handleUpdateExpense = async (expenseId, formData) => {
        try {
            const updatedExpense = await api.updateExpense(expenseId, formData);
            if (!updatedExpense.carLicensePlate) {
                setExpenses(prev => prev.map(exp => (exp.id === expenseId ? updatedExpense : exp)));
            }
            setAllExpenses(prev => prev.map(exp => (exp.id === expenseId ? updatedExpense : exp)));
            setExpenseToEdit(null);
            if (carToView) setCarToView(prev => ({ ...prev }));
        } catch (error) { console.error("Error al actualizar gasto:", error); throw error; }
    };

    const confirmDeleteExpense = async (expenseId) => {
        try {
            await api.deleteExpense(expenseId);
            setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
            setAllExpenses(prev => prev.filter(exp => exp.id !== expenseId));
            if (carToView) setCarToView(prev => ({ ...prev }));
        } catch (error) { console.error("Error al eliminar gasto:", error); } 
        finally { setExpenseToDelete(null); }
    };

    // --- INICIO DE LA MODIFICACIÓN ---
    const handleGestoriaPickup = async (car, pickupDate) => {
        try {
            const updatedCar = await api.updateCar(car.id, { gestoriaPickupDate: pickupDate });
            const updateState = (prevCar) => (prevCar.id === updatedCar.id ? updatedCar : prevCar);
            setCars(prev => prev.map(updateState));
            if (carToView?.id === car.id) {
                setCarToView(updatedCar);
            }
            setCarForGestoriaPickup(null);
        } catch (error) {
            console.error("Error al registrar la recogida de la gestoría:", error);
        }
    };

    const handleGestoriaReturn = async (car, returnDate) => {
         try {
            const updatedCar = await api.updateCar(car.id, { gestoriaReturnDate: returnDate });
            const updateState = (prevCar) => (prevCar.id === updatedCar.id ? updatedCar : prevCar);
            setCars(prev => prev.map(updateState));
            if (carToView?.id === car.id) {
                setCarToView(updatedCar);
            }
            setCarForGestoriaReturn(null);
            setCarToNotify(updatedCar); // Abrir el siguiente modal
        } catch (error) {
            console.error("Error al registrar la entrega de la gestoría:", error);
        }
    };
    // --- FIN DE LA MODIFICACIÓN ---

    return {
        // Datos
        isDataLoading,
        cars,
        expenses,
        allExpenses,
        incidents,
        locations,
        users,

        // Estados de Modales
        isAddUserModalOpen, setAddUserModalOpen,
        userToEdit, setUserToEdit,
        userToDelete, setUserToDelete,
        carToSell, setCarToSell,
        carToView, setCarToView,
        isAddCarModalOpen, setAddCarModalOpen,
        carForIncident, setCarForIncident,
        carToEdit, setCarToEdit,
        carToDelete, setCarToDelete,
        isAddExpenseModalOpen, setAddExpenseModalOpen,
        carForExpense, setCarForExpense,
        expenseToEdit, setExpenseToEdit,
        expenseToDelete, setExpenseToDelete,
        incidentToDelete, setIncidentToDelete,
        isDeleteAccountModalOpen, setIsDeleteAccountModalOpen,
        carToReserve, setCarToReserve,
        carToCancelReservation, setCarToCancelReservation,
        isInvestmentModalOpen, setInvestmentModalOpen,
        isRevenueModalOpen, setRevenueModalOpen,
        reservationSuccessData, setReservationSuccessData,
        carForGestoriaPickup, setCarForGestoriaPickup, // <--- NUEVO
        carForGestoriaReturn, setCarForGestoriaReturn, // <--- NUEVO
        carToNotify, setCarToNotify,                   // <--- NUEVO

        // Toast y borrado
        toast,
        handleUndoDelete,
        setToast,

        // Handlers
        handleUserAdded,
        handleUserUpdated,
        handleUserDeleted,
        handleAddCar,
        handleUpdateCar,
        handleDeleteCar,
        handleSellConfirm,
        handleReserveConfirm,
        handleConfirmCancelReservation,
        handleUpdateCarInsurance,
        handleDeleteNote,
        handleAddIncident,
        handleDeleteIncident,
        confirmDeleteIncident,
        handleResolveIncident,
        handleAddExpense,
        handleUpdateExpense,
        confirmDeleteExpense,
        handleGestoriaPickup, // <--- NUEVO
        handleGestoriaReturn  // <--- NUEVO
    };
};