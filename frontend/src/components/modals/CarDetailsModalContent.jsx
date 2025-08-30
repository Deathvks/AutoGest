// frontend/src/components/modals/CarDetailsModalContent.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTimes, faEuroSign, faTachometerAlt, faGasPump, faCogs, faCalendarAlt, 
    faMapMarkerAlt, faStickyNote, faFingerprint, faIdCard, faExclamationTriangle, 
    faCheckCircle, faPencilAlt, faTrashAlt, faFileInvoiceDollar, faBan, faHandHoldingUsd,
    faBell, faTags, faBolt
} from '@fortawesome/free-solid-svg-icons';

const DetailItem = ({ icon, label, value }) => (
    <div className="flex flex-col">
        <div className="flex items-center text-sm text-text-secondary mb-1">
            <FontAwesomeIcon icon={icon} className="w-4 h-4 mr-2" />
            <span>{label}</span>
        </div>
        <p className="font-semibold text-text-primary break-words">{value || 'No especificado'}</p>
    </div>
);

const IncidentItem = ({ incident, onResolve, onDelete }) => (
    <div className="bg-background p-3 rounded-lg flex items-start justify-between">
        <div>
            <p className="text-sm text-text-primary">{incident.description}</p>
            <p className="text-xs text-text-secondary mt-1">
                {new Date(incident.date).toLocaleDateString()} - 
                <span className={`font-semibold ${incident.status === 'resuelta' ? 'text-green-accent' : 'text-yellow-accent'}`}>
                    {incident.status === 'resuelta' ? ' Resuelta' : ' Pendiente'}
                </span>
            </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {incident.status !== 'resuelta' && (
                <button onClick={() => onResolve(incident.id)} className="text-green-accent hover:opacity-75 transition-opacity" title="Marcar como resuelta">
                    <FontAwesomeIcon icon={faCheckCircle} />
                </button>
            )}
            <button onClick={() => onDelete(incident.id)} className="text-red-accent hover:opacity-75 transition-opacity" title="Eliminar incidencia">
                <FontAwesomeIcon icon={faTrashAlt} />
            </button>
        </div>
    </div>
);

const CarDetailsModalContent = ({ car, incidents, onClose, onSellClick, onEditClick, onDeleteClick, onReserveClick, onCancelReservationClick, onResolveIncident, onDeleteIncident, onDeleteNote }) => {
    const getStatusChipClass = (status) => {
        switch (status) {
            case 'En venta': return 'bg-accent/10 text-accent';
            case 'Vendido': return 'bg-green-accent/10 text-green-accent';
            case 'Reservado': return 'bg-yellow-accent/10 text-yellow-accent';
            default: return 'bg-component-bg-hover text-text-secondary';
        }
    };

    const carIncidents = incidents.filter(i => i.carId === car.id);

    let parsedNotes = [];
    if (car.notes) {
        try {
            const parsed = JSON.parse(car.notes);
            if (Array.isArray(parsed)) {
                parsedNotes = parsed;
            }
        } catch (e) {
            // Si no es JSON, lo tratamos como una nota antigua
            parsedNotes = [{
                id: new Date(car.updatedAt).getTime(),
                content: car.notes,
                type: 'General',
                date: new Date(car.updatedAt).toISOString().split('T')[0]
            }];
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
                            <p className="text-lg text-text-secondary">Precio de Venta</p>
                            <div className="flex flex-col items-center">
                                <p className="text-4xl font-extrabold text-accent">
                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}
                                </p>
                                {car.status === 'Reservado' && car.reservationDeposit > 0 && (
                                    <p className="text-sm font-semibold text-yellow-accent mt-1">
                                        Reserva: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.reservationDeposit)}
                                    </p>
                                )}
                            </div>
                            <span className={`mt-2 inline-block text-sm font-bold px-3 py-1 rounded-full ${getStatusChipClass(car.status)}`}>
                                {car.status}
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
                                <DetailItem icon={faEuroSign} label="Precio Compra" value={new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)} />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Identificación y Ubicación</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DetailItem icon={faIdCard} label="Matrícula" value={car.licensePlate} />
                                <DetailItem icon={faFingerprint} label="Nº de Bastidor" value={car.vin} />
                                <DetailItem icon={faMapMarkerAlt} label="Ubicación" value={car.location} />
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
                    <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Incidencias</h3>
                    <div className="space-y-3">
                        {carIncidents.length > 0 ? (
                            carIncidents.map(incident => (
                                <IncidentItem key={incident.id} incident={incident} onResolve={onResolveIncident} onDelete={onDeleteIncident} />
                            ))
                        ) : (
                            <p className="text-sm text-text-secondary text-center py-4">No hay incidencias registradas para este vehículo.</p>
                        )}
                    </div>
                </section>
            </div>
            
            <div className="flex-shrink-0 p-4 border-t border-border-color flex flex-wrap justify-end gap-3">
                 {car.status === 'En venta' && (
                    <>
                        <button onClick={() => onSellClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-green-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                            <FontAwesomeIcon icon={faHandHoldingUsd} /> Vender
                        </button>
                        <button onClick={() => onReserveClick(car)} className="px-4 py-2 text-sm font-semibold text-white bg-yellow-accent rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2">
                           <FontAwesomeIcon icon={faBell} /> Reservar
                        </button>
                    </>
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