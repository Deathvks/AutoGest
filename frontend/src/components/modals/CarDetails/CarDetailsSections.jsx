// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsSections.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faIdCard, faPhone, faEnvelope, faMapPin, faCalendarDay,
    faCalendarCheck, faTruckPickup, faCheckCircle, faTrashAlt, faEdit,
    // --- INICIO DE LA MODIFICACIÓN ---
    faPaperclip, faUndo, faSpinner, faBuilding, faFileInvoice, faRoad, faMapMarkerAlt
    // --- FIN DE LA MODIFICACIÓN ---
} from '@fortawesome/free-solid-svg-icons';
import api from '../../../services/api';
import { DetailItem } from './CarDetailsUtils';

const BuyerSection = ({ car }) => {
    let buyer = null;
    if (car.buyerDetails) {
        try {
            buyer = typeof car.buyerDetails === 'string' ? JSON.parse(car.buyerDetails) : car.buyerDetails;
        } catch (e) {
            console.error("Error al parsear datos del comprador:", e);
        }
    }
    if (car.status !== 'Vendido' || !buyer) return null;

    const isCompany = buyer.cif && buyer.cif.trim() !== '';
    
    // --- INICIO DE LA MODIFICACIÓN ---
    // Construir la dirección completa a partir de las partes
    const fullAddress = [
        buyer.streetAddress,
        buyer.postalCode,
        buyer.city,
        buyer.province
    ].filter(part => part && part.trim() !== '').join(', ');
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <section>
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2 uppercase">Datos del Comprador</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
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
                
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                {/* Mostrar la dirección completa en un solo campo, o el campo 'address' antiguo si existe */}
                <DetailItem 
                    icon={faMapMarkerAlt} 
                    label="Dirección" 
                    value={fullAddress || buyer.address} 
                />
                {/* --- FIN DE LA MODIFICACIÓN --- */}
            </div>
        </section>
    );
};

const GestoriaSection = ({ car, onGestoriaPickupClick, onGestoriaReturnClick }) => {
    if (car.status !== 'Vendido') return null;

    return (
        <section>
            <h3 className="text-lg font-semibold text-text-primary my-4 border-b border-border-color pb-2 uppercase">Gestión Documentación</h3>
            <div className="bg-component-bg-hover p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-border-color">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    <DetailItem icon={faCalendarDay} label="Recogida" value={car.gestoriaPickupDate ? new Date(car.gestoriaPickupDate).toLocaleDateString('es-ES') : 'Pendiente'} />
                    <DetailItem icon={faCalendarCheck} label="Entrega" value={car.gestoriaReturnDate ? new Date(car.gestoriaReturnDate).toLocaleDateString('es-ES') : 'Pendiente'} />
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                    {!car.gestoriaPickupDate ? (
                        <button onClick={() => onGestoriaPickupClick(car)} className="w-full sm:w-auto bg-accent text-white px-4 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover text-sm font-semibold flex items-center justify-center gap-2 uppercase">
                            <FontAwesomeIcon icon={faTruckPickup} />
                            Registrar Recogida
                        </button>
                    ) : !car.gestoriaReturnDate ? (
                        <button onClick={() => onGestoriaReturnClick(car)} className="w-full sm:w-auto bg-accent text-white px-4 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover text-sm font-semibold flex items-center justify-center gap-2 uppercase">
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            Registrar Entrega
                        </button>
                    ) : (
                        <p className="text-sm font-semibold text-green-accent flex items-center gap-2 uppercase">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Proceso Finalizado
                        </p>
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
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2 uppercase">Anotaciones</h3>
            <div className="space-y-3">
                {parsedNotes.length > 0 ? (
                    parsedNotes.map(note => (
                        <div key={note.id} className="bg-component-bg-hover p-3 rounded-lg flex items-start justify-between gap-4 border border-border-color">
                            <div>
                                <p className="text-sm text-text-primary uppercase">{note.content}</p>
                                <p className="text-xs text-text-secondary mt-1 uppercase">
                                    {note.type} - {new Date(note.date).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                            <button onClick={() => onDeleteNote(car, note.id)} className="text-red-accent/70 hover:text-red-accent transition-opacity flex-shrink-0 p-1" title="Eliminar nota">
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 bg-component-bg-hover rounded-lg border border-border-color">
                        <p className="text-sm text-text-secondary uppercase">No hay anotaciones.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const ExpenseItem = ({ expense, onEditExpenseClick, onDeleteExpense }) => (
    <div className="bg-component-bg-hover p-4 rounded-lg border border-border-color">
        <div className="flex items-start justify-between">
            <div>
                <p className="font-semibold text-text-primary uppercase">{expense.category}</p>
                <p className="text-sm text-text-secondary">{new Date(expense.date).toLocaleDateString()}</p>
                {expense.description && <p className="text-sm text-text-primary mt-1 uppercase">{expense.description}</p>}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                <p className="font-bold text-red-accent text-lg">- {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</p>
                <div className="mt-2 flex items-center gap-4">
                    <button onClick={() => onEditExpenseClick(expense)} className="text-text-secondary hover:text-blue-accent transition-opacity text-xs" title="EDITAR GASTO">
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => onDeleteExpense(expense)} className="text-text-secondary hover:text-red-accent transition-opacity text-xs" title="ELIMINAR GASTO">
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                </div>
            </div>
        </div>
        {expense.attachments && expense.attachments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border-color">
                <div className="flex flex-wrap gap-2">
                    {expense.attachments.map((file, index) => (
                        <a href={file.path} target="_blank" rel="noopener noreferrer" key={index} title={file.originalname} className="text-xs font-semibold text-blue-accent hover:underline bg-blue-accent/10 px-2 py-1 rounded-md uppercase flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faPaperclip} />
                            Adjunto {index + 1}
                        </a>
                    ))}
                </div>
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
            } catch (error) {
                console.error("Error al cargar los gastos del coche:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExpenses();
    }, [car]);

    return (
        <section>
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2 uppercase">Gastos del Vehículo</h3>
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-4 bg-component-bg-hover rounded-lg border border-border-color">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-text-secondary" />
                    </div>
                ) : carExpenses.length > 0 ? (
                    carExpenses.map(expense => <ExpenseItem key={expense.id} expense={expense} onEditExpenseClick={onEditExpenseClick} onDeleteExpense={onDeleteExpense} />)
                ) : (
                    <div className="text-center py-4 bg-component-bg-hover rounded-lg border border-border-color">
                        <p className="text-sm text-text-secondary uppercase">No hay gastos registrados.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const IncidentItem = ({ incident, onResolve, onDelete }) => (
    <div className="bg-component-bg-hover p-3 rounded-lg flex items-start justify-between border border-border-color">
        <div>
            <p className="text-sm text-text-primary uppercase">{incident.description}</p>
            <p className="text-xs text-text-secondary mt-1 uppercase">
                {new Date(incident.date).toLocaleDateString()} -
                <span className={`font-semibold ${incident.status === 'resuelta' ? 'text-green-accent' : 'text-yellow-accent'}`}>
                    {incident.status === 'resuelta' ? ' Resuelta' : ' Pendiente'}
                </span>
            </p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
            <button onClick={() => onResolve(incident.id, incident.status === 'resuelta' ? 'abierta' : 'resuelta')} className={`${incident.status === 'resuelta' ? 'text-yellow-accent' : 'text-green-accent'} hover:opacity-75 transition-opacity`} title={incident.status === 'resuelta' ? 'MARCAR COMO PENDIENTE' : 'MARCAR COMO RESUELTA'}>
                <FontAwesomeIcon icon={incident.status === 'resuelta' ? faUndo : faCheckCircle} />
            </button>
            <button onClick={() => onDelete(incident.id)} className="text-red-accent/70 hover:text-red-accent transition-opacity" title="ELIMINAR INCIDENCIA">
                <FontAwesomeIcon icon={faTrashAlt} />
            </button>
        </div>
    </div>
);

const IncidentsSection = ({ incidents, onResolveIncident, onDeleteIncident }) => (
    <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2 uppercase">Incidencias</h3>
        <div className="space-y-3">
            {incidents.length > 0 ? (
                incidents.map(incident => <IncidentItem key={incident.id} incident={incident} onResolve={onResolveIncident} onDelete={onDeleteIncident} />)
            ) : (
                <div className="text-center py-4 bg-component-bg-hover rounded-lg border border-border-color">
                    <p className="text-sm text-text-secondary uppercase">No hay incidencias registradas.</p>
                </div>
            )}
        </div>
    </section>
);


const CarDetailsSections = (props) => {
    return (
        <div className="space-y-8">
            <BuyerSection {...props} />
            <GestoriaSection {...props} />
            <NotesSection {...props} />
            <ExpensesSection {...props} />
            <IncidentsSection {...props} />
        </div>
    );
};

export default CarDetailsSections;