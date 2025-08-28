// autogest-app/frontend/src/layouts/MainLayout.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import VersionIndicator from '../components/VersionIndicator';

// Componentes y Páginas
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Dashboard from '../pages/Dashboard';
import MyCars from '../pages/MyCars';
import SalesSummary from '../pages/SalesSummary';
import Expenses from '../pages/Expenses';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import ManageUsersPage from '../pages/ManageUsersPage';
import CarDetailsModalContent from '../components/modals/CarDetailsModalContent';
import SellCarModal from '../components/modals/SellCarModal';
import AddCarModal from '../components/modals/AddCarModal';
import EditCarModal from '../components/modals/EditCarModal';
import AddIncidentModal from '../components/modals/AddIncidentModal';
import DeleteCarConfirmationModal from '../components/modals/DeleteCarConfirmationModal';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import ReserveCarModal from '../components/modals/ReserveCarModal';
import CancelReservationModal from '../components/modals/CancelReservationModal';
import Toast from '../components/Toast';
import DeleteExpenseConfirmationModal from '../components/modals/DeleteExpenseConfirmationModal';
import DeleteAccountConfirmationModal from '../components/modals/DeleteAccountConfirmationModal';
import AddUserModal from '../components/modals/AddUserModal';
import EditUserModal from '../components/modals/EditUserModal';
import DeleteUserConfirmationModal from '../components/modals/DeleteUserConfirmationModal';


const MainLayout = () => {
    const { user } = useContext(AuthContext);
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [cars, setCars] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [locations, setLocations] = useState([]);
    
    const [users, setUsers] = useState([]);
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
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    const [carToReserve, setCarToReserve] = useState(null);
    const [carToCancelReservation, setCarToCancelReservation] = useState(null);
    const [toast, setToast] = useState(null);
    const [carPendingDeletion, setCarPendingDeletion] = useState(null);
    const deleteTimeoutRef = useRef(null);

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
                const dataPromises = [
                    api.getCars(),
                    api.getExpenses(),
                    api.getIncidents(),
                    api.getLocations(),
                ];

                if (user && user.role === 'admin') {
                    dataPromises.push(api.admin.getAllUsers());
                }

                const [carsData, expensesData, incidentsData, locationsData, usersData] = await Promise.all(dataPromises);
                
                setCars(carsData);
                setExpenses(expensesData);
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
    
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleUserAdded = (newUser) => {
        setUsers(prev => [newUser, ...prev]);
        setAddUserModalOpen(false);
    };

    const handleUserUpdated = (updatedUser) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        setUserToEdit(null);
    };

    const handleUserDeleted = async (userId) => {
        try {
            await api.admin.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            setUserToDelete(null);
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    };

    const handleAddCar = async (formData) => {
        try {
            const createdCar = await api.createCar(formData);
            setCars(prev => [createdCar, ...prev]);
            fetchLocations();
            setAddCarModalOpen(false);
        } catch (error) { console.error("Error al añadir coche:", error); throw error; }
    };
    const handleUpdateCar = async (formData) => {
        try {
            const carId = carToEdit.id;
            const updatedCar = await api.updateCar(carId, formData);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
            fetchLocations();
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

        if (deleteTimeoutRef.current) {
            clearTimeout(deleteTimeoutRef.current);
        }
        if (carPendingDeletion) {
            confirmDelete(carPendingDeletion.id);
        }

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
                ...carToUpdate,
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
                ...carToUpdate,
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
        } catch (error) {
            console.error("Error al añadir gasto:", error);
            throw error;
        }
    };
    
    const confirmDeleteExpense = async (expenseId) => {
        try {
            await api.deleteExpense(expenseId);
            setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
        } catch (error) {
            console.error("Error al eliminar el gasto:", error);
        } finally {
            setExpenseToDelete(null);
        }
    };

    if (isDataLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-background text-text-primary">Cargando datos...</div>;
    }

    return (
        <div className="flex h-screen bg-background font-sans text-text-secondary">
            <Sidebar />
            <main className="flex-1 overflow-y-auto min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                <Routes>
                    <Route path="/" element={<Dashboard cars={cars} expenses={expenses} isDarkMode={isDarkMode} />} />
                    <Route path="/cars" element={<MyCars cars={cars} incidents={incidents} onSellClick={setCarToSell} onAddClick={() => setAddCarModalOpen(true)} onViewDetailsClick={setCarToView} onAddIncidentClick={setCarForIncident} onReserveClick={setCarToReserve} onCancelReservationClick={setCarToCancelReservation} />} />
                    <Route path="/sales" element={<SalesSummary cars={cars} onViewDetailsClick={setCarToView} />} />
                    <Route path="/expenses" element={<Expenses expenses={expenses} cars={cars} onAddExpense={() => setAddExpenseModalOpen(true)} onDeleteExpense={setExpenseToDelete} />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} cars={cars} expenses={expenses} incidents={incidents} onDeleteAccountClick={() => setIsDeleteAccountModalOpen(true)} />} />
                    
                    <Route path="/admin" element={
                        user && user.role === 'admin' 
                        ? <ManageUsersPage 
                            users={users} 
                            onAddUser={() => setAddUserModalOpen(true)}
                            onEditUser={setUserToEdit}
                            onDeleteUser={setUserToDelete}
                          /> 
                        : <Navigate to="/" replace />
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <BottomNav />
            
            {/* Indicador de versión para PC - esquina inferior derecha */}
            <VersionIndicator className="hidden lg:block fixed bottom-6 right-6 bg-component-bg px-2 py-1 rounded border border-border-color" />
            {toast && (
                <Toast 
                    message={toast.message} 
                    onUndo={handleUndoDelete}
                    onClose={() => setToast(null)}
                />
            )}

            {carToView && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCarToView(null)}>
                    <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
            {expenseToDelete && <DeleteExpenseConfirmationModal expense={expenseToDelete} onClose={() => setExpenseToDelete(null)} onConfirm={confirmDeleteExpense} />}
            {isDeleteAccountModalOpen && <DeleteAccountConfirmationModal onClose={() => setIsDeleteAccountModalOpen(false)} />}
            {carToReserve && <ReserveCarModal car={carToReserve} onClose={() => setCarToReserve(null)} onConfirm={handleReserveConfirm} />}
            {carToCancelReservation && <CancelReservationModal car={carToCancelReservation} onClose={() => setCarToCancelReservation(null)} onConfirm={handleConfirmCancelReservation} />}
            
            {isAddUserModalOpen && <AddUserModal onClose={() => setAddUserModalOpen(false)} onUserAdded={handleUserAdded} />}
            {userToEdit && <EditUserModal user={userToEdit} onClose={() => setUserToEdit(null)} onUserUpdated={handleUserUpdated} />}
            {userToDelete && <DeleteUserConfirmationModal user={userToDelete} onClose={() => setUserToDelete(null)} onConfirmDelete={handleUserDeleted} />}
        </div>
    );
};

export default MainLayout;