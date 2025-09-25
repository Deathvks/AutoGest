// autogest-app/frontend/src/components/AppModals.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faBuilding, faIdCard, faFileInvoice, faMapMarkerAlt, faPhone, faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

// Importa todos los componentes de modales
import CarDetailsModalContent from './modals/CarDetailsModalContent';
import SellCarModal from './modals/SellCarModal';
import AddCarModal from './modals/AddCarModal';
import EditCarModal from './modals/EditCarModal';
import AddIncidentModal from './modals/AddIncidentModal';
import DeleteCarConfirmationModal from './modals/DeleteCarConfirmationModal';
import AddExpenseModal from './modals/AddExpenseModal';
import EditExpenseModal from './modals/EditExpenseModal';
import ReserveCarModal from './modals/ReserveCarModal';
import CancelReservationModal from './modals/CancelReservationModal';
import DeleteExpenseConfirmationModal from './modals/DeleteExpenseConfirmationModal';
import DeleteAccountConfirmationModal from './modals/DeleteAccountConfirmationModal';
import DeleteIncidentConfirmationModal from './modals/DeleteIncidentConfirmationModal';
import AddUserModal from './modals/AddUserModal';
import EditUserModal from './modals/EditUserModal';
import DeleteUserConfirmationModal from './modals/DeleteUserConfirmationModal';
import InvestmentDetailsModal from './modals/InvestmentDetailsModal';
import RevenueDetailsModal from './modals/RevenueDetailsModal';
import ReservationPdfModal from './modals/ReservationPdfModal';
import GestoriaPickupModal from './modals/GestoriaPickupModal';
import GestoriaReturnModal from './modals/GestoriaReturnModal';
import NotifyClientModal from './modals/NotifyClientModal';
import SubscriptionSuccessModal from './modals/SubscriptionSuccessModal';
import LogoutConfirmationModal from './modals/LogoutConfirmationModal';
import TestDriveModal from './modals/TestDriveModal'; // --- INICIO DE LA MODIFICACIÓN ---

const InputField = ({ label, name, value, onChange, icon, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
            {label}
            {required && <span className="text-red-accent ml-1">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
                </div>
            )}
            <input
                type="text" name={name} value={value || ''} onChange={onChange}
                className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-1 focus:border-blue-accent text-text-primary transition-colors border-border-color focus:ring-blue-accent ${icon ? 'pl-9' : ''}`}
            />
        </div>
    </div>
);

const BusinessDataModal = ({ isOpen, onClose, onSave }) => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({});
    const [accountType, setAccountType] = useState('empresa');
    const [error, setError] = useState('');

    const isValidDniNie = (value) => {
        const dniRegex = /^([0-9]{8}[A-Z])$/i;
        const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i;
        value = value.toUpperCase();
        if (!dniRegex.test(value) && !nieRegex.test(value)) return false;
        const controlChars = 'TRWAGMYFPDXBNJZSQVHLCKE';
        let number;
        if (nieRegex.test(value)) {
            const firstChar = value.charAt(0);
            let numPrefix;
            if (firstChar === 'X') numPrefix = '0';
            else if (firstChar === 'Y') numPrefix = '1';
            else if (firstChar === 'Z') numPrefix = '2';
            number = parseInt(numPrefix + value.substring(1, 8), 10);
        } else {
            number = parseInt(value.substring(0, 8), 10);
        }
        return controlChars.charAt(number % 23) === value.charAt(value.length - 1);
    };

    const isValidCif = (value) => {
        value = value.toUpperCase();
        if (!/^[A-Z][0-9]{8}$/.test(value)) return false;
        const controlDigit = value.charAt(value.length - 1);
        const numberPart = value.substring(1, 8);
        let sum = 0;
        for (let i = 0; i < numberPart.length; i++) {
            let num = parseInt(numberPart[i], 10);
            if (i % 2 === 0) {
                num *= 2;
                sum += num < 10 ? num : Math.floor(num / 10) + (num % 10);
            } else {
                sum += num;
            }
        }
        const lastDigitOfSum = sum % 10;
        const calculatedControl = lastDigitOfSum === 0 ? 0 : 10 - lastDigitOfSum;
        if (/[A-Z]/.test(controlDigit)) {
            return String.fromCharCode(64 + calculatedControl) === controlDigit;
        } else {
            return calculatedControl === parseInt(controlDigit, 10);
        }
    };

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                businessName: user.businessName || user.name || '',
                name: user.name || '',
                dni: user.dni || '',
                cif: user.cif || '',
                address: user.address || '',
                phone: user.phone || '',
            });
            setAccountType(user.cif ? 'empresa' : 'particular');
            setError('');
        }
    }, [user, isOpen]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const validateForm = () => {
        if (!formData.address?.trim() || !formData.phone?.trim()) {
            setError('La dirección y el teléfono son obligatorios.');
            return false;
        }
        if (accountType === 'empresa') {
            if (!formData.businessName?.trim() || !formData.cif?.trim()) {
                setError('La razón social y el CIF son obligatorios para empresas.');
                return false;
            }
            if (!isValidCif(formData.cif)) {
                setError('El formato del CIF no es válido.');
                return false;
            }
        } else { // particular
            if (!formData.name?.trim() || !formData.dni?.trim()) {
                setError('El nombre y el DNI/NIE son obligatorios.');
                return false;
            }
            if (!isValidDniNie(formData.dni)) {
                setError('El formato del DNI/NIE no es válido.');
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleConfirmSave = async () => {
        if (!validateForm()) {
            return;
        }

        const dataToSave = new FormData();
        dataToSave.append('email', user.email);
        dataToSave.append('address', formData.address);
        dataToSave.append('phone', formData.phone);

        if (accountType === 'empresa') {
            dataToSave.append('businessName', formData.businessName);
            dataToSave.append('cif', formData.cif);
            dataToSave.append('name', user.name); // Mantenemos el nombre de contacto del usuario
            dataToSave.append('dni', ''); // Limpiamos el campo no relevante
        } else {
            dataToSave.append('name', formData.name);
            dataToSave.append('dni', formData.dni);
            dataToSave.append('businessName', formData.name); // Usamos el nombre como "razón social"
            dataToSave.append('cif', ''); // Limpiamos el campo no relevante
        }

        try {
            await onSave(dataToSave);
        } catch (err) {
            setError(err.message || 'Error al guardar los datos.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <FontAwesomeIcon icon={faBuilding} />
                        DATOS DE FACTURACIÓN
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div className="flex items-center rounded-lg bg-background p-1 border border-border-color text-text-secondary">
                        <button type="button" onClick={() => setAccountType('empresa')} className={`flex-1 px-3 py-1 text-sm rounded-md transition-colors ${accountType === 'empresa' ? 'bg-accent text-white' : 'hover:bg-component-bg-hover'}`}>EMPRESA</button>
                        <button type="button" onClick={() => setAccountType('particular')} className={`flex-1 px-3 py-1 text-sm rounded-md transition-colors ${accountType === 'particular' ? 'bg-accent text-white' : 'hover:bg-component-bg-hover'}`}>AUTÓNOMO / PARTICULAR</button>
                    </div>

                    {accountType === 'empresa' ? (
                        <>
                            <InputField label="RAZÓN SOCIAL" name="businessName" value={formData.businessName} onChange={handleChange} icon={faBuilding} required={true} />
                            <InputField label="CIF" name="cif" value={formData.cif} onChange={handleChange} icon={faFileInvoice} required={true} />
                        </>
                    ) : (
                        <>
                            <InputField label="NOMBRE Y APELLIDOS" name="name" value={formData.name} onChange={handleChange} icon={faUser} required={true} />
                            <InputField label="DNI / NIE" name="dni" value={formData.dni} onChange={handleChange} icon={faIdCard} required={true} />
                        </>
                    )}
                    
                    <hr className="border-border-color" />

                    <InputField label="DIRECCIÓN" name="address" value={formData.address} onChange={handleChange} icon={faMapMarkerAlt} required={true} />
                    <InputField label="TELÉFONO" name="phone" value={formData.phone} onChange={handleChange} icon={faPhone} required={true} />

                    {error && <p className="mt-2 text-sm text-red-accent text-center">{error}</p>}
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end items-center gap-4 p-4 border-t border-border-color">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">CANCELAR</button>
                    <button onClick={handleConfirmSave} className="bg-blue-accent text-white px-6 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity font-semibold">GUARDAR DATOS</button>
                </div>
            </div>
        </div>
    );
};
const AppModals = ({ appState }) => {
    const { logout } = useContext(AuthContext);

    const {
        incidents, locations, allExpenses, cars, users,
        isAddUserModalOpen, setAddUserModalOpen, userToEdit, setUserToEdit,
        userToDelete, setUserToDelete, carToSell, setCarToSell,
        carToView, setCarToView, isAddCarModalOpen, setAddCarModalOpen,
        carForIncident, setCarForIncident, carToEdit, setCarToEdit,
        carToDelete, setCarToDelete, isAddExpenseModalOpen, setAddExpenseModalOpen,
        carForExpense, setCarForExpense, expenseToEdit, setExpenseToEdit,
        expenseToDelete, setExpenseToDelete, incidentToDelete, setIncidentToDelete,
        isDeleteAccountModalOpen, setIsDeleteAccountModalOpen, carToReserve, setCarToReserve,
        carToCancelReservation, setCarToCancelReservation, isInvestmentModalOpen, setInvestmentModalOpen,
        isRevenueModalOpen, setRevenueModalOpen, reservationSuccessData, setReservationSuccessData,
        carForGestoriaPickup, setCarForGestoriaPickup, carForGestoriaReturn, setCarForGestoriaReturn,
        carToNotify, setCarToNotify, isBusinessDataModalOpen, setIsBusinessDataModalOpen,
        isSubscriptionSuccessModalOpen, setSubscriptionSuccessModalOpen,
        isLogoutModalOpen, setLogoutModalOpen,
        carForTestDrive, setCarForTestDrive, // --- INICIO DE LA MODIFICACIÓN ---
        handleSaveBusinessData, handleUserAdded, handleUserUpdated,
        handleUserDeleted, handleAddCar, handleUpdateCar,
        handleDeleteCar, handleSellConfirm, handleReserveConfirm,
        handleConfirmCancelReservation, handleDeleteNote, handleAddIncident,
        handleDeleteIncident, confirmDeleteIncident, handleResolveIncident,
        handleAddExpense, handleUpdateExpense, confirmDeleteExpense,
        handleGestoriaPickup, handleGestoriaReturn
    } = appState;

    return (
        <>
            {carToView && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCarToView(null)}>
                    <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <CarDetailsModalContent
                            car={carToView}
                            incidents={incidents.filter(inc => inc.carId === carToView.id)}
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
                            onGestoriaPickupClick={(car) => { setCarToView(null); setCarForGestoriaPickup(car); }}
                            onGestoriaReturnClick={(car) => { setCarToView(null); setCarForGestoriaReturn(car); }}
                            onUpdateCar={handleUpdateCar}
                            onTestDriveClick={(car) => { setCarToView(null); setCarForTestDrive(car); }} // --- INICIO DE LA MODIFICACIÓN ---
                        />
                    </div>
                </div>
            )}
            
            {isAddCarModalOpen && <AddCarModal onClose={() => setAddCarModalOpen(false)} onAdd={handleAddCar} locations={locations} />}
            {carToEdit && <EditCarModal car={carToEdit} onClose={() => setCarToEdit(null)} onUpdate={(formData) => handleUpdateCar(carToEdit.id, formData)} locations={locations} />}
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
            {reservationSuccessData && <ReservationPdfModal car={reservationSuccessData} onClose={() => setReservationSuccessData(null)} />}

            {isAddUserModalOpen && <AddUserModal onClose={() => setAddUserModalOpen(false)} onUserAdded={handleUserAdded} />}
            {userToEdit && <EditUserModal user={userToEdit} onClose={() => setUserToEdit(null)} onUserUpdated={handleUserUpdated} />}
            {userToDelete && <DeleteUserConfirmationModal user={userToDelete} onClose={() => setUserToDelete(null)} onConfirmDelete={handleUserDeleted} />}

            <InvestmentDetailsModal isOpen={isInvestmentModalOpen} onClose={() => setInvestmentModalOpen(false)} cars={cars} expenses={allExpenses} />
            <RevenueDetailsModal isOpen={isRevenueModalOpen} onClose={() => setRevenueModalOpen(false)} cars={cars} />

            {carForGestoriaPickup && <GestoriaPickupModal car={carForGestoriaPickup} onClose={() => setCarForGestoriaPickup(null)} onConfirm={handleGestoriaPickup} />}
            {carForGestoriaReturn && <GestoriaReturnModal car={carForGestoriaReturn} onClose={() => setCarForGestoriaReturn(null)} onConfirm={handleGestoriaReturn} />}
            {carToNotify && <NotifyClientModal car={carToNotify} onClose={() => setCarToNotify(null)} />}
            
            <BusinessDataModal 
                isOpen={isBusinessDataModalOpen} 
                onClose={() => setIsBusinessDataModalOpen(false)} 
                onSave={handleSaveBusinessData} 
            />
            
            <SubscriptionSuccessModal 
                isOpen={isSubscriptionSuccessModalOpen}
                onClose={() => setSubscriptionSuccessModalOpen(false)}
            />
            <LogoutConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={logout}
            />
            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            {carForTestDrive && <TestDriveModal car={carForTestDrive} onClose={() => setCarForTestDrive(null)} />}
            {/* --- FIN DE LA MODIFICACIÓN --- */}
        </>
    );
};

export default AppModals;