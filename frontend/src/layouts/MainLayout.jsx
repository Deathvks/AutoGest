import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from '../services/api';

// Componentes y Páginas
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Dashboard from '../pages/Dashboard';
import MyCars from '../pages/MyCars';
import SalesSummary from '../pages/SalesSummary';
import Expenses from '../pages/Expenses';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import CarDetailsModalContent from '../components/modals/CarDetailsModalContent';
import SellCarModal from '../components/modals/SellCarModal';
import AddCarModal from '../components/modals/AddCarModal';
import EditCarModal from '../components/modals/EditCarModal';
import AddIncidentModal from '../components/modals/AddIncidentModal';
import DeleteCarConfirmationModal from '../components/modals/DeleteCarConfirmationModal';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import ReserveCarModal from '../components/modals/ReserveCarModal';
import CancelReservationModal from '../components/modals/CancelReservationModal';

const MainLayout = () => {
    // Estados de la UI
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Estados de Datos
    const [cars, setCars] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [locations, setLocations] = useState([]);

    // Estados para los Modales
    const [carToSell, setCarToSell] = useState(null);
    const [carToView, setCarToView] = useState(null);
    const [isAddCarModalOpen, setAddCarModalOpen] = useState(false);
    const [carForIncident, setCarForIncident] = useState(null);
    const [carToEdit, setCarToEdit] = useState(null);
    const [carToDelete, setCarToDelete] = useState(null);
    const [isAddExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
    const [carToReserve, setCarToReserve] = useState(null);
    const [carToCancelReservation, setCarToCancelReservation] = useState(null);

    // --- FUNCIONES DE CARGA DE DATOS ---
    const fetchLocations = async () => {
        try {
            const locationsData = await api.getLocations();
            setLocations(locationsData);
        } catch (error) {
            console.error("Error al cargar ubicaciones:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsDataLoading(true);
            try {
                const [carsData, expensesData, incidentsData, locationsData] = await Promise.all([
                    api.getCars(),
                    api.getExpenses(),
                    api.getIncidents(),
                    api.getLocations(),
                ]);
                setCars(carsData);
                setExpenses(expensesData);
                setIncidents(incidentsData);
                setLocations(locationsData);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setIsDataLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // --- MANEJADORES DE EVENTOS (HANDLERS) ---
    const handleAddCar = async (formData) => {
        try {
            const createdCar = await api.createCar(formData);
            setCars(prev => [createdCar, ...prev]);
            fetchLocations();
            setAddCarModalOpen(false);
        } catch (error) { console.error("Error al añadir coche:", error); }
    };

    const handleUpdateCar = async (formData) => {
        try {
            const carId = carToEdit.id;
            const updatedCar = await api.updateCar(carId, formData);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
            fetchLocations();
            setCarToEdit(null);
        } catch (error) { console.error("Error al actualizar coche:", error); }
    };

    const handleDeleteCar = async (carId) => {
        try {
            await api.deleteCar(carId);
            setCars(prev => prev.filter(c => c.id !== carId));
            setCarToDelete(null);
            setCarToView(null);
        } catch (error) { console.error("Error al eliminar coche:", error); }
    };

    const handleSellConfirm = async (carId, salePrice) => {
        try {
            const carToUpdate = cars.find(c => c.id === carId);
            if (!carToUpdate) return;
            const updatedData = { ...carToUpdate, status: 'Vendido', salePrice, price: salePrice };
            const updatedCar = await api.updateCar(carId, updatedData);
            setCars(prev => prev.map(c => c.id === carId ? updatedCar : c));
            setCarToSell(null);
        } catch (error) { console.error("Error al vender el coche:", error); }
    };
    
    const handleReserveConfirm = async (carToUpdate, reservationNotes, depositAmount) => {
        try {
            const updatedData = { 
                status: 'Reservado', 
                notes: reservationNotes, 
                reservationDeposit: depositAmount 
            };
            const updatedCar = await api.updateCar(carToUpdate.id, updatedData);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
            setCarToReserve(null);
        } catch (error) {
            console.error("Error al reservar el coche:", error);
        }
    };

    const handleConfirmCancelReservation = async (carToUpdate) => {
        try {
            const updatedData = {
                status: 'En venta',
                reservationDeposit: null,
                notes: `Reserva cancelada. Nota anterior: ${carToUpdate.notes || ''}`.trim()
            };
            const updatedCar = await api.updateCar(carToUpdate.id, updatedData);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
            setCarToCancelReservation(null);
        } catch (error) {
            console.error("Error al cancelar la reserva:", error);
        }
    };

    const handleAddIncident = async (car, description) => {
        const incidentData = { date: new Date().toISOString().split('T')[0], description, licensePlate: car.licensePlate, carId: car.id };
        try {
            const newIncident = await api.createIncident(incidentData);
            setIncidents(prev => [newIncident, ...prev]);
            setCarForIncident(null);
        } catch (error) { console.error("Error al añadir incidencia:", error); }
    };

    const handleDeleteIncident = async (incidentId) => {
        try {
            await api.deleteIncident(incidentId);
            setIncidents(prev => prev.filter(inc => inc.id !== incidentId));
        } catch (error) { console.error("Error al eliminar incidencia:", error); }
    };

    const handleResolveIncident = async (incidentId) => {
        try {
            const updatedIncident = await api.updateIncident(incidentId, { status: 'resuelta' });
            setIncidents(prev => prev.map(inc => 
                inc.id === incidentId ? updatedIncident : inc
            ));
        } catch (error) {
            console.error("Error al resolver la incidencia:", error);
        }
    };

    const handleAddExpense = async (expenseData) => {
        try {
            const newExpense = await api.createExpense(expenseData);
            setExpenses(prev => [newExpense, ...prev]);
            setAddExpenseModalOpen(false);
        } catch (error) { console.error("Error al añadir gasto:", error); }
    };

    if (isDataLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">Cargando datos...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                <Routes>
                    <Route path="/" element={<Dashboard cars={cars} expenses={expenses} isDarkMode={isDarkMode} />} />
                    <Route path="/cars" element={<MyCars cars={cars} incidents={incidents} onSellClick={setCarToSell} onAddClick={() => setAddCarModalOpen(true)} onViewDetailsClick={setCarToView} onAddIncidentClick={setCarForIncident} onReserveClick={setCarToReserve} onCancelReservationClick={setCarToCancelReservation} />} />
                    <Route path="/sales" element={<SalesSummary cars={cars} onViewDetailsClick={setCarToView} />} />
                    <Route path="/expenses" element={<Expenses expenses={expenses} cars={cars} onAddExpense={() => setAddExpenseModalOpen(true)} />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} cars={cars} expenses={expenses} incidents={incidents} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <BottomNav />

            {/* Modales */}
            {carToView && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCarToView(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <CarDetailsModalContent 
                            car={carToView} 
                            incidents={incidents} 
                            onClose={() => setCarToView(null)} 
                            onSellClick={car => { setCarToView(null); setCarToSell(car); }} 
                            onEditClick={(car) => { setCarToView(null); setCarToEdit(car); }} 
                            onDeleteClick={setCarToDelete}
                            onReserveClick={car => { setCarToView(null); setCarToReserve(car); }}
                            onCancelReservationClick={setCarToCancelReservation} 
                            onResolveIncident={handleResolveIncident}
                            onDeleteIncident={handleDeleteIncident}
                        />
                    </div>
                </div>
            )}
            {isAddCarModalOpen && <AddCarModal onClose={() => setAddCarModalOpen(false)} onAdd={handleAddCar} locations={locations} />}
            {carToEdit && <EditCarModal car={carToEdit} onClose={() => setCarToEdit(null)} onUpdate={handleUpdateCar} locations={locations} />}
            {carToSell && <SellCarModal car={carToSell} onClose={() => setCarToSell(null)} onConfirm={handleSellConfirm} />}
            {carForIncident && <AddIncidentModal car={carForIncident} onClose={() => setCarForIncident(null)} onConfirm={handleAddIncident} />}
            {carToDelete && <DeleteCarConfirmationModal car={carToDelete} onClose={() => setCarToDelete(null)} onConfirm={handleDeleteCar} />}
            {isAddExpenseModalOpen && <AddExpenseModal cars={cars} onClose={() => setAddExpenseModalOpen(false)} onAdd={handleAddExpense} />}
            {carToReserve && <ReserveCarModal car={carToReserve} onClose={() => setCarToReserve(null)} onConfirm={handleReserveConfirm} />}
            {carToCancelReservation && <CancelReservationModal car={carToCancelReservation} onClose={() => setCarToCancelReservation(null)} onConfirm={handleConfirmCancelReservation} />}
        </div>
    );
};

export default MainLayout;