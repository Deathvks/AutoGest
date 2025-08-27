// autogest-app/frontend/src/components/modals/CarDetailsModalContent.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faTag, faExclamationTriangle, faBolt, faXmark, faHandshake, faPaperclip, faBan, faCheck } from '@fortawesome/free-solid-svg-icons';

// --- Sub-componentes ---
const StatusChip = ({ status }) => {
    const statusStyles = {
        'En venta': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
        'Vendido': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
        'Reservado': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
        'Taller': 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
    };
    return ( <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}> {status} </span> );
};

const DetailItem = ({ label, value, icon, iconClassName }) => (
    <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            {icon && <FontAwesomeIcon icon={icon} className={`w-3 h-3 ${iconClassName || 'text-slate-400'}`} />}
            <span>{value || '-'}</span>
        </div>
    </div>
);

// --- Componente Principal ---
const CarDetailsModalContent = ({ car, incidents, onClose, onSellClick, onEditClick, onDeleteClick, onReserveClick, onCancelReservationClick, onResolveIncident }) => {
    const carIncidents = incidents.filter(inc => inc.licensePlate === car.licensePlate);
    const placeholderImage = `https://placehold.co/800x500/e2e8f0/1e293b?text=${car.make}+${car.model}`;

    let carTags = car.tags;
    if (typeof carTags === 'string') {
        try { carTags = JSON.parse(carTags); } catch (e) { carTags = []; }
    }
    if (!Array.isArray(carTags)) { carTags = []; }

    return (
        <div className="relative bg-white dark:bg-black rounded-xl overflow-hidden shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-black/40 text-white rounded-full p-1 hover:bg-black/60 transition-colors"
                aria-label="Cerrar modal"
            >
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>

            <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                <img 
                    className="w-full h-64 object-cover"
                    src={car.imageUrl || placeholderImage} 
                    alt={`Coche ${car.make} ${car.model}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                />
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{car.make}</p>
                    <StatusChip status={car.status} />
                </div>
                <h3 className="text-2xl leading-7 font-bold text-slate-800 dark:text-slate-100">{car.model}</h3>
                <p className="mt-3 text-3xl font-light text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}</p>
                
                {car.status === 'Reservado' && car.reservationDeposit > 0 && (
                    <div className="mt-3 text-sm font-semibold text-amber-600 dark:text-amber-400">
                        <span>Depósito de reserva: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.reservationDeposit)}</span>
                    </div>
                )}

                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4 text-sm border-t border-slate-200 dark:border-slate-800 pt-4">
                    <DetailItem label="Matrícula" value={car.licensePlate} />
                    <DetailItem label="Bastidor" value={car.vin} />
                    <DetailItem label="KM" value={new Intl.NumberFormat('es-ES').format(car.km)} />
                    <DetailItem label="Matriculación" value={car.registrationDate ? new Date(car.registrationDate).toLocaleDateString('es-ES') : '-'} />
                    <DetailItem label="Combustible" value={car.fuel} />
                    <DetailItem label="Cambio" value={car.transmission} />
                    {car.horsepower && <DetailItem label="Caballos (CV)" value={car.horsepower} icon={faBolt} iconClassName="text-amber-500" />}
                </div>

                {carTags && carTags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {carTags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-md">{tag}</span>
                        ))}
                    </div>
                )}

                {car.registrationDocumentUrl && (
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Documentación</h4>
                        <a href={car.registrationDocumentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                            <FontAwesomeIcon icon={faPaperclip} />
                            Ver Permiso de Circulación
                        </a>
                    </div>
                )}
                
                {car.notes && (
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Anotaciones</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{car.notes}</p>
                    </div>
                )}
                 {carIncidents.length > 0 && (
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Historial de Incidencias</h4>
                        <ul className="space-y-2">
                            {carIncidents.map(incident => (
                                <li key={incident.id} className={`flex justify-between items-center group transition-colors ${incident.status === 'resuelta' ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                                    <span><span className="font-semibold">{new Date(incident.date).toLocaleDateString('es-ES')}:</span> {incident.description}</span>
                                    {incident.status === 'abierta' && (
                                        <button onClick={() => onResolveIncident(incident.id)} title="Marcar como resuelta" className="text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100">
                                            <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button onClick={() => onEditClick(car)} className="inline-flex items-center gap-2 p-2 text-sm font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDeleteClick(car)} className="inline-flex items-center gap-2 p-2 text-sm font-medium text-rose-600 bg-rose-100 dark:bg-rose-900/50 dark:text-rose-300 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors">
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                         {car.status === 'En venta' && (
                            <button onClick={() => onReserveClick(car)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors">
                                <FontAwesomeIcon icon={faHandshake} className="w-4 h-4" />
                                Reservar
                            </button>
                        )}
                        {car.status === 'Reservado' && (
                             <button onClick={() => onCancelReservationClick(car)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                <FontAwesomeIcon icon={faBan} className="w-4 h-4" />
                                Cancelar Reserva
                            </button>
                        )}
                        {(car.status === 'En venta' || car.status === 'Taller' || car.status === 'Reservado') && (
                            <button onClick={() => onSellClick(car)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors">
                                <FontAwesomeIcon icon={faTag} className="w-4 h-4" />
                                Vender
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarDetailsModalContent;