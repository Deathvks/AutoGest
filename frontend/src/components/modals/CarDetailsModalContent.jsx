// autogest-app/frontend/src/components/modals/CarDetailsModalContent.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTimes, faEuroSign, faTachometerAlt, faGasPump, faCogs, faCalendarAlt, 
    faMapMarkerAlt, faStickyNote, faFingerprint, faIdCard, faExclamationTriangle, 
    faCheckCircle, faPencilAlt, faTrashAlt, faFileInvoiceDollar, faBan, faHandHoldingUsd,
    faBell, faTags, faBolt, faShieldAlt, faPaperclip, faEdit, faUser, faPhone, faEnvelope, faMapPin, faUndo
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const DetailItem = ({ icon, label, value }) => (
    <div className="flex flex-col">
        <div className="flex items-center text-sm text-text-secondary mb-1">
            <FontAwesomeIcon icon={icon} className="w-4 h-4 mr-2" />
            <span>{label}</span>
        </div>
        <p className="font-semibold text-text-primary break-words">{value || 'No especificado'}</p>
    </div>
);

const FileLinkItem = ({ label, urls }) => {
    const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

    const formatFilename = (url) => {
        const filename = url.split('/').pop().split('?')[0]; // Limpia query params si los hubiera
        const maxLength = 25;

        if (filename.length <= maxLength) {
            return filename;
        }

        const lastDot = filename.lastIndexOf('.');
        if (lastDot === -1) { // Sin extensión
            return filename.substring(0, maxLength - 3) + '...';
        }

        const name = filename.substring(0, lastDot);
        const ext = filename.substring(lastDot);
        
        const maxNameLength = maxLength - ext.length - 3;
        const truncatedName = name.substring(0, maxNameLength);
        
        return truncatedName + '...' + ext;
    };

    if (!urls || urls.length === 0) {
        return <DetailItem icon={faPaperclip} label={label} value="No hay archivos" />;
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center text-sm text-text-secondary mb-1">
                <FontAwesomeIcon icon={faPaperclip} className="w-4 h-4 mr-2" />
                <span>{label}</span>
            </div>
            <div className="flex flex-col gap-1">
                {urls.map((url, index) => (
                    <a 
                        href={`${API_BASE_URL}${url}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        key={index}
                        className="text-sm font-semibold text-blue-accent hover:underline flex items-center gap-2"
                        title={url.split('/').pop()}
                    >
                        <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3" />
                        {formatFilename(url)}
                    </a>
                ))}
            </div>
        </div>
    );
};


const IncidentItem = ({ incident, onResolve, onDelete }) => (
    <div className="bg-background p-3 rounded-lg flex items-start justify-between">
        <div>
            <p className="text-sm text-text-primary">{incident.description}</p>
            <p className="text-xs text-text-secondary mt-1">
                {new Date(incident.date).toLocaleDateString()} - 
                <span className={`font-semibold ${incident.status === 'resuelta' ? 'text-green-accent' : 'text-accent'}`}>
                    {incident.status === 'resuelta' ? ' Resuelta' : ' Pendiente'}
                </span>
            </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button 
                onClick={() => onResolve(incident.id, incident.status === 'resuelta' ? 'abierta' : 'resuelta')} 
                className={`${incident.status === 'resuelta' ? 'text-accent' : 'text-green-accent'} hover:opacity-75 transition-opacity`} 
                title={incident.status === 'resuelta' ? 'Marcar como pendiente' : 'Marcar como resuelta'}
            >
                <FontAwesomeIcon icon={incident.status === 'resuelta' ? faUndo : faCheckCircle} />
            </button>
            <button onClick={() => onDelete(incident.id)} className="text-red-accent hover:opacity-75 transition-opacity" title="Eliminar incidencia">
                <FontAwesomeIcon icon={faTrashAlt} />
            </button>
        </div>
    </div>
);

const ExpenseItem = ({ expense, onEditExpenseClick, onDeleteExpense }) => {
    const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

    return (
        <div className="bg-background p-3 rounded-lg">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold text-text-primary">{expense.category}</p>
                    <p className="text-sm text-text-secondary">{new Date(expense.date).toLocaleDateString()}</p>
                    {expense.description && <p className="text-sm text-text-primary mt-1">{expense.description}</p>}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-bold text-red-accent">- {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</p>
                    <div className="mt-1">
                        <button onClick={() => onEditExpenseClick(expense)} className="text-blue-accent hover:opacity-75 transition-opacity text-xs mr-3" title="Editar gasto">
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button onClick={() => onDeleteExpense(expense)} className="text-red-accent hover:opacity-75 transition-opacity text-xs" title="Eliminar gasto">
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                    </div>
                </div>
            </div>
            {expense.attachments && expense.attachments.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border-color">
                    <p className="text-xs font-semibold text-text-secondary mb-1">Adjuntos:</p>
                    <div className="flex flex-wrap gap-2">
                        {expense.attachments.map((fileUrl, index) => (
                            <a 
                                href={`${API_BASE_URL}${fileUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                key={index}
                                className="text-xs text-blue-accent hover:underline bg-blue-accent/10 px-2 py-1 rounded-md"
                            >
                                <FontAwesomeIcon icon={faPaperclip} className="mr-1" />
                                Adjunto {index + 1}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const CarDetailsModalContent = ({ car, incidents, onClose, onSellClick, onEditClick, onDeleteClick, onReserveClick, onCancelReservationClick, onResolveIncident, onDeleteIncident, onDeleteNote, onAddExpenseClick, onEditExpenseClick, onDeleteExpense, onAddIncidentClick }) => {
    const [carExpenses, setCarExpenses] = useState([]);
    const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            if (!car) return;
            setIsLoadingExpenses(true);
            try {
                const expensesData = await api.getExpensesByCarLicensePlate(car.licensePlate);
                setCarExpenses(expensesData);
            } catch (error) {
                console.error("Error al cargar los gastos del coche:", error);
            } finally {
                setIsLoadingExpenses(false);
            }
        };

        fetchExpenses();
    }, [car]);

    const getStatusChipClass = (status) => {
        switch (status) {
            case 'En venta': return 'bg-accent/10 text-accent';
            case 'Vendido': return 'bg-green-accent/10 text-green-accent';
            case 'Reservado': return 'bg-yellow-accent/10 text-yellow-accent';
            default: return 'bg-component-bg-hover text-text-secondary';
        }
    };

    let buyer = null;
    if (car.buyerDetails) {
        try {
            buyer = typeof car.buyerDetails === 'string' ? JSON.parse(car.buyerDetails) : car.buyerDetails;
        } catch (e) {
            console.error("Error al parsear datos del comprador:", e);
        }
    }

    let parsedNotes = [];
    if (car.notes) {
        try {
            const parsed = JSON.parse(car.notes);
            if (Array.isArray(parsed)) parsedNotes = parsed;
        } catch (e) {
            parsedNotes = [{ id: new Date(car.updatedAt).getTime(), content: car.notes, type: 'General', date: new Date(car.updatedAt).toISOString().split('T')[0] }];
        }
    }
    
    let tagsToShow = [];
    if (typeof car.tags === 'string') {
        try {
            tagsToShow = JSON.parse(car.tags);
        } catch (e) {
            tagsToShow = []; 
        }
    } else if (Array.isArray(car.tags)) {
        tagsToShow = car.tags;
    }

    return (
        <div className="bg-component-bg rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">{car.make} {car.model}</h2>
                    <p className="text-sm text-text-secondary">{car.licensePlate}</p>
                </div>
                <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                    <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <img 
                            src={car.imageUrl || `https://placehold.co/600x400/f1f3f5/6c757d?text=${car.make}+${car.model}`}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-auto object-cover rounded-lg border border-border-color"
                        />
                        <div className="bg-background p-4 rounded-lg text-center">
                            <div className="flex flex-col items-center">
                                <p className="text-lg text-text-secondary">Precio Venta Final</p>
                                <p className="text-4xl font-extrabold text-accent">
                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice || car.price)}
                                </p>
                                <p className="text-sm text-text-secondary mt-1">
                                    Compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                                </p>
                                {car.status === 'Reservado' && car.reservationDeposit > 0 && (
                                    <p className="text-sm font-semibold text-yellow-accent mt-1">
                                        Reserva: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.reservationDeposit)}
                                    </p>
                                )}
                            </div>
                            <span className={`mt-2 inline-block text-sm font-bold px-3 py-1 rounded-full ${getStatusChipClass(car.status)}`}>
                                {car.status} {car.saleDate ? ` - ${new Date(car.saleDate).toLocaleDateString('es-ES')}` : ''}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Detalles Principales</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem icon={faCalendarAlt} label="Fecha de Matriculación" value={car.registrationDate ? new Date(car.registrationDate).toLocaleDateString('es-ES') : 'N/A'} />
                                <DetailItem icon={faTachometerAlt} label="Kilometraje" value={car.km ? `${new Intl.NumberFormat('es-ES').format(car.km)} km` : 'N/A'} />
                                <DetailItem icon={faGasPump} label="Combustible" value={car.fuel} />
                                <DetailItem icon={faCogs} label="Transmisión" value={car.transmission} />
                                <DetailItem icon={faBolt} label="Potencia" value={car.horsepower ? `${car.horsepower} CV` : 'N/A'} />
                                <DetailItem icon={faShieldAlt} label="Seguro" value={car.hasInsurance ? 'Sí' : 'No'} />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Identificación y Documentos</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DetailItem icon={faIdCard} label="Matrícula" value={car.licensePlate} />
                                <DetailItem icon={faFingerprint} label="Nº de Bastidor" value={car.vin} />
                                <DetailItem icon={faMapMarkerAlt} label="Ubicación" value={car.location} />
                                <FileLinkItem label="Archivos Varios" urls={car.documentUrls} />
                            </div>
                        </section>
                        
                        <section>
                            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Etiquetas</h3>
                             <div className="flex flex-wrap gap-2">
                                {tagsToShow.length > 0 ? tagsToShow.map(tag => (
                                    <span key={tag} className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                                )) : <p className="text-text-primary text-sm font-semibold">Sin etiquetas</p>}
                            </div>
                        </section>
                    </div>
                </div>

                {car.status === 'Vendido' && buyer && (
                    <section>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Datos del Comprador</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <DetailItem icon={faUser} label="Nombre" value={`${buyer.name || ''} ${buyer.lastName || ''}`} />
                            <DetailItem icon={faIdCard} label="DNI/NIE" value={buyer.dni} />
                            <DetailItem icon={faPhone} label="Teléfono" value={buyer.phone} />
                            <DetailItem icon={faEnvelope} label="Email" value={buyer.email} />
                            <DetailItem icon={faMapPin} label="Dirección" value={buyer.address} />
                        </div>
                        <hr className="border-border-color mt-8" />
                    </section>
                )}

                <section>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Anotaciones</h3>
                    <div className="space-y-3">
                        {parsedNotes.length > 0 ? (
                            parsedNotes.map(note => (
                                <div key={note.id} className="bg-background p-3 rounded-lg flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-text-primary">{note.content}</p>
                                        <p className="text-xs text-text-secondary mt-1">
                                            {note.type} - {new Date(note.date).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                    <button onClick={() => onDeleteNote(car, note.id)} className="text-red-accent hover:opacity-75 transition-opacity flex-shrink-0" title="Eliminar nota">
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-text-secondary text-center py-4">No hay anotaciones.</p>
                        )}
                    </div>
                </section>
                
                <section>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Gastos del Vehículo</h3>
                    <div className="space-y-3">
                        {isLoadingExpenses ? (
                            <p className="text-sm text-text-secondary text-center py-4">Cargando gastos...</p>
                        ) : carExpenses.length > 0 ? (
                            carExpenses.map(expense => (
                                <ExpenseItem key={expense.id} expense={expense} onEditExpenseClick={onEditExpenseClick} onDeleteExpense={onDeleteExpense} />
                            ))
                        ) : (
                            <p className="text-sm text-text-secondary text-center py-4">No hay gastos registrados para este vehículo.</p>
                        )}
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Incidencias</h3>
                    <div className="space-y-3">
                        {incidents.length > 0 ? (
                            incidents.map(incident => (
                                <IncidentItem key={incident.id} incident={incident} onResolve={onResolveIncident} onDelete={onDeleteIncident} />
                            ))
                        ) : (
                            <p className="text-sm text-text-secondary text-center py-4">No hay incidencias registradas para este vehículo.</p>
                        )}
                    </div>
                </section>
            </div>
            
            <div className="flex-shrink-0 p-4 border-t border-border-color flex flex-wrap justify-center sm:justify-end gap-3">
                <button onClick={() => onAddExpenseClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-accent rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                    <FontAwesomeIcon icon={faFileInvoiceDollar} /> Añadir Gasto
                </button>
                {car.status === 'Vendido' && (
                    <button onClick={() => onAddIncidentClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} /> Añadir Incidencia
                    </button>
                )}
                 {(car.status === 'En venta' || car.status === 'Reservado') && (
                    <button onClick={() => onSellClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-2">
                        <FontAwesomeIcon icon={faHandHoldingUsd} /> Vender
                    </button>
                )}
                {car.status === 'En venta' && (
                    <button onClick={() => onReserveClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-2">
                       <FontAwesomeIcon icon={faBell} /> Reservar
                    </button>
                )}
                {car.status === 'Reservado' && (
                     <button onClick={() => onCancelReservationClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-red-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                        <FontAwesomeIcon icon={faBan} /> Cancelar Reserva
                    </button>
                )}
                <button onClick={() => onEditClick(car)} className="px-4 py-2 text-sm font-semibold text-text-primary bg-component-bg-hover rounded-lg border border-border-color hover:bg-border-color flex items-center gap-2">
                   <FontAwesomeIcon icon={faPencilAlt} /> Editar
                </button>
                <button onClick={() => onDeleteClick(car)} className="px-4 py-2 text-sm font-semibold text-red-accent bg-red-accent/10 rounded-lg hover:bg-red-accent/20 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTrashAlt} /> Eliminar
                </button>
            </div>
        </div>
    );
};

export default CarDetailsModalContent;