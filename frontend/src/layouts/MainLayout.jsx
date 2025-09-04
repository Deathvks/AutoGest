// autogest-app/frontend/src/layouts/MainLayout.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import VersionIndicator from '../components/VersionIndicator';

// Componentes y Páginas
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
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
import EditExpenseModal from '../components/modals/EditExpenseModal';
import ReserveCarModal from '../components/modals/ReserveCarModal';
import CancelReservationModal from '../components/modals/CancelReservationModal';
import Toast from '../components/Toast';
import DeleteExpenseConfirmationModal from '../components/modals/DeleteExpenseConfirmationModal';
import DeleteAccountConfirmationModal from '../components/modals/DeleteAccountConfirmationModal';
import DeleteIncidentConfirmationModal from '../components/modals/DeleteIncidentConfirmationModal';
import AddUserModal from '../components/modals/AddUserModal';
import EditUserModal from '../components/modals/EditUserModal';
import DeleteUserConfirmationModal from '../components/modals/DeleteUserConfirmationModal';
import InvestmentDetailsModal from '../components/modals/InvestmentDetailsModal';
import RevenueDetailsModal from '../components/modals/RevenueDetailsModal';
import InsuranceConfirmationModal from '../components/modals/InsuranceConfirmationModal';


const MainLayout = ({ isDarkMode, setIsDarkMode }) => {
    const { user } = useContext(AuthContext);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [cars, setCars] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
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
    const [carForExpense, setCarForExpense] = useState(null);
    const [expenseToEdit, setExpenseToEdit] = useState(null);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [incidentToDelete, setIncidentToDelete] = useState(null);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    const [carToReserve, setCarToReserve] = useState(null);
    const [carToCancelReservation, setCarToCancelReservation] = useState(null);
    const [toast, setToast] = useState(null);
    const [carPendingDeletion, setCarPendingDeletion] = useState(null);
    const deleteTimeoutRef = useRef(null);
    const [isInvestmentModalOpen, setInvestmentModalOpen] = useState(false);
    const [isRevenueModalOpen, setRevenueModalOpen] = useState(false);

    useEffect(() => {
        const isAnyModalOpen =
            isAddUserModalOpen || !!userToEdit || !!userToDelete || !!carToSell ||
            !!carToView || isAddCarModalOpen || !!carForIncident || !!carToEdit ||
            !!carToDelete || isAddExpenseModalOpen || !!expenseToEdit || !!expenseToDelete ||
            !!incidentToDelete || isDeleteAccountModalOpen || !!carToReserve || !!carToCancelReservation ||
            isInvestmentModalOpen || isRevenueModalOpen;

        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [
        isAddUserModalOpen, userToEdit, userToDelete, carToSell, carToView,
        isAddCarModalOpen, carForIncident, carToEdit, carToDelete,
        isAddExpenseModalOpen, expenseToEdit, expenseToDelete, incidentToDelete, isDeleteAccountModalOpen,
        carToReserve, carToCancelReservation, isInvestmentModalOpen, isRevenueModalOpen
    ]);

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
                    api.getExpenses(), // Para la página de Gastos (solo generales)
                    api.getAllUserExpenses(), // Para Dashboard y SalesSummary (todos los gastos)
                    api.getIncidents(),
                    api.getLocations(),
                ];

                if (user && user.role === 'admin') {
                    dataPromises.push(api.admin.getAllUsers());
                }

                const [carsData, expensesData, allExpensesData, incidentsData, locationsData, usersData] = await Promise.all(dataPromises);

                setCars(carsData);
                setExpenses(expensesData); // Solo gastos generales
                setAllExpenses(allExpensesData); // Todos los gastos
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

    const handleSellConfirm = async (carId, salePrice, saleDate, buyerDetails) => {
        try {
            const updatedData = {
                status: 'Vendido',
                salePrice,
                saleDate,
                buyerDetails: JSON.stringify(buyerDetails)
            };
            const updatedCar = await api.updateCar(carId, updatedData);
            setCars(prev => prev.map(c => c.id === carId ? updatedCar : c));
            setCarToSell(null);
        } catch (error) {
            console.error("Error al vender el coche:", error);
        }
    };

    const handleReserveConfirm = async (carToUpdate, newNoteContent, depositAmount) => {
        try {
            let existingNotes = [];
            if (carToUpdate.notes) {
                try {
                    const parsed = JSON.parse(carToUpdate.notes);
                    if (Array.isArray(parsed)) {
                        existingNotes = parsed;
                    }
                } catch (e) {
                    existingNotes = [{
                        id: new Date(carToUpdate.updatedAt).getTime(),
                        content: carToUpdate.notes,
                        type: 'General',
                        date: new Date(carToUpdate.updatedAt).toISOString().split('T')[0]
                    }];
                }
            }

            if (newNoteContent && newNoteContent.trim() !== '') {
                existingNotes.push({
                    id: Date.now(),
                    content: newNoteContent,
                    type: 'Reserva',
                    date: new Date().toISOString().split('T')[0]
                });
            }

            const dataToSend = {
                status: 'Reservado',
                notes: JSON.stringify(existingNotes),
                reservationDeposit: depositAmount
            };

            const updatedCar = await api.updateCar(carToUpdate.id, dataToSend);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
            setCarToReserve(null);
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

            const updatedData = {
                status: 'En venta',
                reservationDeposit: null,
                notes: JSON.stringify(updatedNotes)
            };
            const updatedCar = await api.updateCar(carToUpdate.id, updatedData);
            setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
            setCarToCancelReservation(null);
            if (carToView && carToView.id === updatedCar.id) {
                setCarToView(updatedCar);
            }
        } catch (error) {
            console.error("Error al cancelar la reserva:", error);
        }
    };

    const handleUpdateCarInsurance = async (car, hasInsurance) => {
        const originalCars = [...cars];
        const updatedCars = cars.map(c =>
            c.id === car.id ? { ...c, hasInsurance } : c
        );
        setCars(updatedCars);

        try {
            await api.updateCar(car.id, { hasInsurance });
        } catch (error) {
            console.error("Error al actualizar el seguro del coche:", error);
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
                } catch (e) { /* No es un JSON válido, se ignora */ }
            }

            const updatedNotes = notes.filter(note => note.id !== noteIdToDelete);
            const updatedCarData = await api.updateCar(car.id, { notes: JSON.stringify(updatedNotes) });

            const updatedCars = cars.map(c => (c.id === updatedCarData.id ? updatedCarData : c));
            setCars(updatedCars);
            setCarToView({ ...updatedCarData });
        } catch (error) {
            console.error("Error al eliminar la nota:", error);
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
    const handleDeleteIncident = (incidentId) => {
        const incident = incidents.find(inc => inc.id === incidentId);
        if (incident) {
            setIncidentToDelete(incident);
        }
    };

    const confirmDeleteIncident = async (incidentId) => {
        try {
            await api.deleteIncident(incidentId);
            setIncidents(prev => prev.filter(inc => inc.id !== incidentId));
        } catch (error) {
            console.error("Error al eliminar incidencia:", error);
        } finally {
            setIncidentToDelete(null);
        }
    };
    const handleResolveIncident = async (incidentId, newStatus) => {
        try {
            const updatedIncident = await api.updateIncident(incidentId, { status: newStatus });
            setIncidents(prev => prev.map(inc =>
                inc.id === incidentId ? updatedIncident : inc
            ));
        } catch (error) {
            console.error("Error al cambiar el estado de la incidencia:", error);
        }
    };

    const handleAddExpense = async (expenseData) => {
        try {
            const newExpense = await api.createExpense(expenseData);
            if (!expenseData.has('carLicensePlate')) {
                setExpenses(prev => [newExpense, ...prev]);
            }
            // Actualizar también allExpenses para Dashboard y SalesSummary
            setAllExpenses(prev => [newExpense, ...prev]);
            setAddExpenseModalOpen(false);
            setCarForExpense(null);
            if (carToView) {
                setCarToView(prev => ({ ...prev }));
            }
        } catch (error) {
            console.error("Error al añadir gasto:", error);
            throw error;
        }
    };

    const handleUpdateExpense = async (expenseId, formData) => {
        try {
            const updatedExpense = await api.updateExpense(expenseId, formData);
            if (!updatedExpense.carLicensePlate) {
                setExpenses(prev => prev.map(exp => (exp.id === expenseId ? updatedExpense : exp)));
            }
            // Actualizar también allExpenses para Dashboard y SalesSummary
            setAllExpenses(prev => prev.map(exp => (exp.id === expenseId ? updatedExpense : exp)));
            setExpenseToEdit(null);
            if (carToView) {
                setCarToView(prev => ({ ...prev }));
            }
        } catch (error) {
            console.error("Error al actualizar gasto:", error);
            throw error;
        }
    };

    const confirmDeleteExpense = async (expenseId) => {
        try {
            await api.deleteExpense(expenseId);
            setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
            // Actualizar también allExpenses para Dashboard y SalesSummary
            setAllExpenses(prev => prev.filter(exp => exp.id !== expenseId));
            if (carToView) {
                setCarToView(prev => ({ ...prev }));
            }
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
            <div className="flex flex-col flex-1 min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                    <Routes>
                        <Route path="/" element={<Dashboard cars={cars} expenses={allExpenses} isDarkMode={isDarkMode} onTotalInvestmentClick={() => setInvestmentModalOpen(true)} onRevenueClick={() => setRevenueModalOpen(true)} />} />
                        <Route path="/cars" element={<MyCars cars={cars} incidents={incidents} onSellClick={setCarToSell} onAddClick={() => setAddCarModalOpen(true)} onViewDetailsClick={setCarToView} onAddIncidentClick={setCarForIncident} onReserveClick={setCarToReserve} onCancelReservationClick={setCarToCancelReservation} onUpdateInsurance={handleUpdateCarInsurance} />} />
                        <Route path="/sales" element={<SalesSummary cars={cars} expenses={allExpenses} onViewDetailsClick={setCarToView} />} />
                        <Route path="/expenses" element={<Expenses expenses={expenses} onAddExpense={() => { setCarForExpense(null); setAddExpenseModalOpen(true); }} onEditExpense={setExpenseToEdit} onDeleteExpense={setExpenseToDelete} />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} cars={cars} expenses={expenses} incidents={incidents} onDeleteAccountClick={() => setIsDeleteAccountModalOpen(true)} />} />
                        <Route path="/admin" element={user && user.role === 'admin' ? <ManageUsersPage users={users} onAddUser={() => setAddUserModalOpen(true)} onEditUser={setUserToEdit} onDeleteUser={setUserToDelete} /> : <Navigate to="/" replace />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
            <BottomNav />

            <VersionIndicator className="hidden lg:block fixed bottom-6 right-6 bg-component-bg px-2 py-1 rounded border border-border-color" />
            {toast && (<Toast message={toast.message} onUndo={handleUndoDelete} onClose={() => setToast(null)} />)}

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
                            onDeleteNote={handleDeleteNote}
                            onAddExpenseClick={(car) => { setCarForExpense(car); setAddExpenseModalOpen(true); }}
                            onEditExpenseClick={setExpenseToEdit}
                            onDeleteExpense={setExpenseToDelete}
                            onAddIncidentClick={(car) => { setCarToView(null); setCarForIncident(car); }}
                        />
                    </div>
                </div>
            )}

            {isAddCarModalOpen && <AddCarModal onClose={() => setAddCarModalOpen(false)} onAdd={handleAddCar} locations={locations} />}
            {carToEdit && <EditCarModal car={carToEdit} onClose={() => setCarToEdit(null)} onUpdate={handleUpdateCar} locations={locations} />}
            {carToSell && <SellCarModal car={carToSell} onClose={() => setCarToSell(null)} onConfirm={handleSellConfirm} />}
            {carForIncident && <AddIncidentModal car={carForIncident} onClose={() => setCarForIncident(null)} onConfirm={handleAddIncident} />}
            {carToDelete && <DeleteCarConfirmationModal car={carToDelete} onClose={() => setCarToDelete(null)} onConfirm={handleDeleteCar} />}
            {isAddExpenseModalOpen && <AddExpenseModal car={carForExpense} onClose={() => { setAddExpenseModalOpen(false); setCarForExpense(null); }} onAdd={handleAddExpense} />}
            {expenseToEdit && <EditExpenseModal expense={expenseToEdit} onClose={() => setExpenseToEdit(null)} onUpdate={handleUpdateExpense} />}
            {expenseToDelete && <DeleteExpenseConfirmationModal expense={expenseToDelete} onClose={() => setExpenseToDelete(null)} onConfirm={confirmDeleteExpense} />}
            {incidentToDelete && <DeleteIncidentConfirmationModal incident={incidentToDelete} onClose={() => setIncidentToDelete(null)} onConfirm={confirmDeleteIncident} />}
            {isDeleteAccountModalOpen && <DeleteAccountConfirmationModal onClose={() => setIsDeleteAccountModalOpen(false)} />}
            {carToReserve && <ReserveCarModal car={carToReserve} onClose={() => setCarToReserve(null)} onConfirm={handleReserveConfirm} />}
            {carToCancelReservation && <CancelReservationModal car={carToCancelReservation} onClose={() => setCarToCancelReservation(null)} onConfirm={handleConfirmCancelReservation} />}

            {isAddUserModalOpen && <AddUserModal onClose={() => setAddUserModalOpen(false)} onUserAdded={handleUserAdded} />}
            {userToEdit && <EditUserModal user={userToEdit} onClose={() => setUserToEdit(null)} onUserUpdated={handleUserUpdated} />}
            {userToDelete && <DeleteUserConfirmationModal user={userToDelete} onClose={() => setUserToDelete(null)} onConfirmDelete={handleUserDeleted} />}

            <InvestmentDetailsModal
                isOpen={isInvestmentModalOpen}
                onClose={() => setInvestmentModalOpen(false)}
                cars={cars}
                expenses={expenses}
            />

            <RevenueDetailsModal
                isOpen={isRevenueModalOpen}
                onClose={() => setRevenueModalOpen(false)}
                cars={cars}
            />
        </div>
    );
};

export default MainLayout;