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
    <h3 className="text-[13px] font-bold text-[#6B7280] mb-4 uppercase tracking-wider border-b border-[#E5E7EB] pb-2">
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
            <div className="bg-[#F2F4F8] rounded-[20px] border border-[#E5E7EB] p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
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
            <div className="bg-[#F2F4F8] p-5 rounded-[20px] border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full">
                    <DetailItem icon={faCalendarDay} label="Recogida" value={car.gestoriaPickupDate ? new Date(car.gestoriaPickupDate).toLocaleDateString('es-ES') : 'Pendiente'} />
                    <DetailItem icon={faCalendarCheck} label="Entrega" value={car.gestoriaReturnDate ? new Date(car.gestoriaReturnDate).toLocaleDateString('es-ES') : 'Pendiente'} />
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                    {!car.gestoriaPickupDate ? (
                        <button onClick={() => onGestoriaPickupClick(car)} className="w-full bg-[#020B1C] text-white px-5 py-2.5 rounded-[12px] hover:bg-[#06122A] text-[13px] font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faTruckPickup} /> Registrar Recogida
                        </button>
                    ) : !car.gestoriaReturnDate ? (
                        <button onClick={() => onGestoriaReturnClick(car)} className="w-full bg-[#020B1C] text-white px-5 py-2.5 rounded-[12px] hover:bg-[#06122A] text-[13px] font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faCalendarCheck} /> Registrar Entrega
                        </button>
                    ) : (
                        <div className="bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20 px-5 py-2.5 rounded-[12px] flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide">
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
                        <div key={note.id} className="bg-yellow-50 p-4 rounded-[14px] border border-yellow-200 flex justify-between gap-4">
                            <div>
                                <p className="text-[14px] font-medium text-[#06122A]">{note.content}</p>
                                <p className="text-[12px] text-yellow-700 mt-1 font-bold uppercase tracking-wide">{note.type} - {new Date(note.date).toLocaleDateString('es-ES')}</p>
                            </div>
                            <button onClick={() => onDeleteNote(car, note.id)} className="text-[#6B7280] hover:text-[#DC2626] transition-colors self-start p-1">
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 bg-[#F2F4F8] rounded-[14px] border border-[#E5E7EB] border-dashed">
                        <p className="text-[14px] font-medium text-[#6B7280]">No hay anotaciones.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const ExpenseItem = ({ expense, onEditExpenseClick, onDeleteExpense }) => (
    <div className="bg-white p-5 rounded-[14px] border border-[#E5E7EB] shadow-sm hover:border-[#020B1C]/30 transition-colors">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-[#06122A] uppercase text-[14px] tracking-wide">{expense.category}</p>
                <p className="text-[12px] font-medium text-[#6B7280] mt-1">{new Date(expense.date).toLocaleDateString()}</p>
                {expense.description && <p className="text-[14px] text-[#06122A]/80 mt-2">{expense.description}</p>}
            </div>
            <div className="text-right">
                <p className="font-bold text-[#DC2626] text-lg tracking-tight">- {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</p>
                <div className="mt-3 flex items-center justify-end gap-4">
                    <button onClick={() => onEditExpenseClick(expense)} className="text-[#6B7280] hover:text-[#020B1C] transition-colors">
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => onDeleteExpense(expense)} className="text-[#6B7280] hover:text-[#DC2626] transition-colors">
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                </div>
            </div>
        </div>
        {expense.attachments && expense.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex flex-wrap gap-2">
                {expense.attachments.map((file, index) => (
                    <a key={index} href={file.path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#1E3A8A] bg-[#DBEAFE] px-3 py-1.5 rounded-[8px] hover:bg-[#DBEAFE]/70 transition-colors tracking-wide">
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
                    <div className="text-center py-4"><FontAwesomeIcon icon={faSpinner} spin className="text-[#020B1C]" /></div>
                ) : carExpenses.length > 0 ? (
                    carExpenses.map(exp => <ExpenseItem key={exp.id} expense={exp} onEditExpenseClick={onEditExpenseClick} onDeleteExpense={onDeleteExpense} />)
                ) : (
                    <div className="text-center py-6 bg-[#F2F4F8] rounded-[14px] border border-[#E5E7EB] border-dashed">
                        <p className="text-[14px] font-medium text-[#6B7280]">No hay gastos registrados.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const IncidentItem = ({ incident, onResolve, onDelete }) => (
    <div className="bg-white p-5 rounded-[14px] border border-[#E5E7EB] shadow-sm flex justify-between items-start gap-4">
        <div>
            <p className="text-[14px] font-medium text-[#06122A]">{incident.description}</p>
            <div className="flex items-center gap-2 mt-2 text-[12px] font-bold uppercase tracking-wide">
                <span className="text-[#6B7280]">{new Date(incident.date).toLocaleDateString()}</span>
                <span className="text-[#E5E7EB]">•</span>
                <span className={`${incident.status === 'resuelta' ? 'text-[#16A34A]' : 'text-yellow-600'}`}>
                    {incident.status === 'resuelta' ? 'Resuelta' : 'Pendiente'}
                </span>
            </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
            <button onClick={() => onResolve(incident.id, incident.status === 'resuelta' ? 'abierta' : 'resuelta')} className={`p-1 transition-colors ${incident.status === 'resuelta' ? 'text-yellow-600 hover:text-yellow-700' : 'text-[#16A34A] hover:text-green-700'}`}>
                <FontAwesomeIcon icon={incident.status === 'resuelta' ? faUndo : faCheckCircle} size="lg" />
            </button>
            <button onClick={() => onDelete(incident.id)} className="p-1 text-[#6B7280] hover:text-[#DC2626] transition-colors">
                <FontAwesomeIcon icon={faTrashAlt} size="lg" />
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
                <div className="text-center py-6 bg-[#F2F4F8] rounded-[14px] border border-[#E5E7EB] border-dashed">
                    <p className="text-[14px] font-medium text-[#6B7280]">No hay incidencias registradas.</p>
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