// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsSections.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faIdCard, faPhone, faEnvelope, faCalendarDay,
    faCalendarCheck, faTruckPickup, faCheckCircle, faTrashAlt, faEdit,
    faPaperclip, faUndo, faSpinner, faBuilding, faFileInvoice, faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import api from '../../../services/api';
import { DetailItem } from './CarDetailsUtils';

const SectionHeader = ({ title }) => (
    <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-200 pb-2">
        {title}
    </h3>
);

const BuyerSection = ({ car }) => {
    let buyer = null;
    if (car.buyerDetails) {
        try {
            buyer = typeof car.buyerDetails === 'string' ? JSON.parse(car.buyerDetails) : car.buyerDetails;
        } catch (e) { console.error(e); }
    }
    if (car.status !== 'Vendido' || !buyer) return null;

    const isCompany = buyer.cif && buyer.cif.trim() !== '';
    const fullAddress = [buyer.streetAddress, buyer.postalCode, buyer.city, buyer.province].filter(p => p && p.trim()).join(', ');

    return (
        <section>
            <SectionHeader title="Datos del Comprador" />
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    {isCompany ? (
                        <>
                            <DetailItem icon={faBuilding} label="Razón Social" value={buyer.businessName} />
                            <DetailItem icon={faFileInvoice} label="CIF" value={buyer.cif} />
                        </>
                    ) : (
                        <>
                            <DetailItem icon={faUser} label="Nombre" value={`${buyer.name || ''} ${buyer.lastName || ''}`} />
                            <DetailItem icon={faIdCard} label="DNI/NIE" value={buyer.dni} />
                        </>
                    )}
                    <DetailItem icon={faPhone} label="Teléfono" value={buyer.phone} />
                    <DetailItem icon={faEnvelope} label="Email" value={buyer.email} />
                    <DetailItem icon={faMapMarkerAlt} label="Dirección" value={fullAddress || buyer.address} />
                </div>
            </div>
        </section>
    );
};

const GestoriaSection = ({ car, onGestoriaPickupClick, onGestoriaReturnClick }) => {
    if (car.status !== 'Vendido') return null;

    return (
        <section>
            <SectionHeader title="Gestión Documentación" />
            <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full">
                    <DetailItem icon={faCalendarDay} label="Recogida" value={car.gestoriaPickupDate ? new Date(car.gestoriaPickupDate).toLocaleDateString('es-ES') : 'Pendiente'} />
                    <DetailItem icon={faCalendarCheck} label="Entrega" value={car.gestoriaReturnDate ? new Date(car.gestoriaReturnDate).toLocaleDateString('es-ES') : 'Pendiente'} />
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                    {!car.gestoriaPickupDate ? (
                        <button onClick={() => onGestoriaPickupClick(car)} className="w-full bg-accent text-white px-4 py-2 rounded shadow hover:bg-accent-hover text-sm font-bold uppercase transition-colors flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faTruckPickup} /> Registrar Recogida
                        </button>
                    ) : !car.gestoriaReturnDate ? (
                        <button onClick={() => onGestoriaReturnClick(car)} className="w-full bg-accent text-white px-4 py-2 rounded shadow hover:bg-accent-hover text-sm font-bold uppercase transition-colors flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faCalendarCheck} /> Registrar Entrega
                        </button>
                    ) : (
                        <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded flex items-center gap-2 text-sm font-bold uppercase">
                            <FontAwesomeIcon icon={faCheckCircle} /> Finalizado
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

const NotesSection = ({ car, onDeleteNote }) => {
    let parsedNotes = [];
    if (car.notes) {
        try {
            const parsed = JSON.parse(car.notes);
            if (Array.isArray(parsed)) parsedNotes = parsed;
        } catch (e) {
            parsedNotes = [{ id: new Date(car.updatedAt).getTime(), content: car.notes, type: 'General', date: new Date(car.updatedAt).toISOString().split('T')[0] }];
        }
    }

    return (
        <section>
            <SectionHeader title="Anotaciones" />
            <div className="space-y-3">
                {parsedNotes.length > 0 ? (
                    parsedNotes.map(note => (
                        <div key={note.id} className="bg-yellow-50/50 p-3 rounded border border-yellow-200 flex justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-800">{note.content}</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium uppercase">{note.type} - {new Date(note.date).toLocaleDateString('es-ES')}</p>
                            </div>
                            <button onClick={() => onDeleteNote(car, note.id)} className="text-gray-400 hover:text-red-600 transition-colors self-start">
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded border border-gray-200 border-dashed">
                        <p className="text-sm text-gray-500">No hay anotaciones.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const ExpenseItem = ({ expense, onEditExpenseClick, onDeleteExpense }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-gray-800 uppercase text-sm">{expense.category}</p>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(expense.date).toLocaleDateString()}</p>
                {expense.description && <p className="text-sm text-gray-600 mt-2">{expense.description}</p>}
            </div>
            <div className="text-right">
                <p className="font-bold text-red-600 text-lg">- {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</p>
                <div className="mt-2 flex items-center justify-end gap-3">
                    <button onClick={() => onEditExpenseClick(expense)} className="text-gray-400 hover:text-accent transition-colors">
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => onDeleteExpense(expense)} className="text-gray-400 hover:text-red-600 transition-colors">
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                </div>
            </div>
        </div>
        {expense.attachments && expense.attachments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                {expense.attachments.map((file, index) => (
                    <a key={index} href={file.path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                        <FontAwesomeIcon icon={faPaperclip} /> Adjunto {index + 1}
                    </a>
                ))}
            </div>
        )}
    </div>
);

const ExpensesSection = ({ car, onEditExpenseClick, onDeleteExpense }) => {
    const [carExpenses, setCarExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            if (!car) return;
            setIsLoading(true);
            try {
                const data = await api.getExpensesByCarLicensePlate(car.licensePlate);
                setCarExpenses(data);
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        };
        fetchExpenses();
    }, [car]);

    return (
        <section>
            <SectionHeader title="Gastos del Vehículo" />
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-4"><FontAwesomeIcon icon={faSpinner} spin className="text-accent" /></div>
                ) : carExpenses.length > 0 ? (
                    carExpenses.map(exp => <ExpenseItem key={exp.id} expense={exp} onEditExpenseClick={onEditExpenseClick} onDeleteExpense={onDeleteExpense} />)
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded border border-gray-200 border-dashed">
                        <p className="text-sm text-gray-500">No hay gastos registrados.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const IncidentItem = ({ incident, onResolve, onDelete }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-start gap-4">
        <div>
            <p className="text-sm font-medium text-gray-800">{incident.description}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 uppercase">
                <span>{new Date(incident.date).toLocaleDateString()}</span>
                <span>•</span>
                <span className={`font-bold ${incident.status === 'resuelta' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {incident.status === 'resuelta' ? 'Resuelta' : 'Pendiente'}
                </span>
            </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => onResolve(incident.id, incident.status === 'resuelta' ? 'abierta' : 'resuelta')} className={`p-1 ${incident.status === 'resuelta' ? 'text-yellow-500 hover:text-yellow-600' : 'text-green-500 hover:text-green-600'}`}>
                <FontAwesomeIcon icon={incident.status === 'resuelta' ? faUndo : faCheckCircle} />
            </button>
            <button onClick={() => onDelete(incident.id)} className="p-1 text-gray-400 hover:text-red-600">
                <FontAwesomeIcon icon={faTrashAlt} />
            </button>
        </div>
    </div>
);

const IncidentsSection = ({ incidents, onResolveIncident, onDeleteIncident }) => (
    <section>
        <SectionHeader title="Incidencias" />
        <div className="space-y-3">
            {incidents.length > 0 ? (
                incidents.map(inc => <IncidentItem key={inc.id} incident={inc} onResolve={onResolveIncident} onDelete={onDeleteIncident} />)
            ) : (
                <div className="text-center py-6 bg-gray-50 rounded border border-gray-200 border-dashed">
                    <p className="text-sm text-gray-500">No hay incidencias registradas.</p>
                </div>
            )}
        </div>
    </section>
);

const CarDetailsSections = (props) => (
    <div className="space-y-8">
        <BuyerSection {...props} />
        <GestoriaSection {...props} />
        <NotesSection {...props} />
        <ExpensesSection {...props} />
        <IncidentsSection {...props} />
    </div>
);

export default CarDetailsSections;