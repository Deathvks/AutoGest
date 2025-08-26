import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlusCircle, 
    faSearch, 
    faExclamationTriangle, 
    faTag, 
    faCar,
    faBolt,
    faHandshake,
    faHandHoldingDollar,
    faBan
} from '@fortawesome/free-solid-svg-icons';
import Select from '../components/Select';

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

const CarCard = ({ car, onSellClick, onViewDetailsClick, onAddIncidentClick, onReserveClick, onCancelReservationClick, hasIncident }) => {
    const placeholderImage = `https://placehold.co/600x400/e2e8f0/1e293b?text=${car.make}+${car.model}`;
    
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="flex-shrink-0">
                <img 
                    className="h-48 w-full object-cover" 
                    src={car.imageUrl || placeholderImage} 
                    alt={`Coche ${car.make} ${car.model}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                />
            </div>
            <div className="p-6 flex flex-col justify-between w-full flex-1">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{car.make}</p>
                        <StatusChip status={car.status} />
                    </div>
                    <h3 className="text-xl leading-7 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {car.model}
                        {hasIncident && <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 text-amber-500" title="Este coche tiene incidencias abiertas" />}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-slate-600 dark:text-slate-300">Matrícula:</span> {car.licensePlate}</p>
                    <p className="mt-2 text-2xl font-light text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}</p>
                    
                    <div className="mt-1 flex justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>{new Intl.NumberFormat('es-ES').format(car.km)} km</span>
                        {car.horsepower && (
                            <span className="flex items-center gap-1 font-medium">
                                <FontAwesomeIcon icon={faBolt} className="w-3 h-3 text-amber-500" />
                                {car.horsepower} CV
                            </span>
                        )}
                    </div>
                    {car.status === 'Reservado' && car.reservationDeposit > 0 && (
                        <div className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 p-2 rounded-md flex items-center gap-2">
                            <FontAwesomeIcon icon={faHandHoldingDollar} />
                            <span>Reserva: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.reservationDeposit)}</span>
                        </div>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <button onClick={() => onViewDetailsClick(car)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Ver más
                    </button>
                    <div className="flex items-center gap-2">
                        {car.status === 'Vendido' && (
                            <button onClick={() => onAddIncidentClick(car)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                                Incidencia
                            </button>
                        )}
                        {car.status === 'En venta' && (
                            <button onClick={() => onReserveClick(car)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors">
                                <FontAwesomeIcon icon={faHandshake} className="w-4 h-4" />
                                Reservar
                            </button>
                        )}
                        {car.status === 'Reservado' && (
                             <button onClick={() => onCancelReservationClick(car)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                <FontAwesomeIcon icon={faBan} className="w-4 h-4" />
                                Cancelar
                            </button>
                        )}
                        {(car.status === 'En venta' || car.status === 'Taller' || car.status === 'Reservado') && (
                            <button onClick={() => onSellClick(car)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors">
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

const MyCars = ({ cars, incidents, onSellClick, onAddClick, onViewDetailsClick, onAddIncidentClick, onReserveClick, onCancelReservationClick }) => {
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [sortOrder, setSortOrder] = useState('default');
    const [searchTerm, setSearchTerm] = useState('');

    const sortOptions = [
        { id: 'default', name: 'Ordenar por...' },
        { id: 'price-desc', name: 'Precio: Mayor a menor' },
        { id: 'price-asc', name: 'Precio: Menor a mayor' },
        { id: 'km-desc', name: 'KM: Mayor a menor' },
        { id: 'km-asc', name: 'KM: Menor a mayor' },
    ];

    const filteredCars = useMemo(() => {
        let filtered = cars;
        if (activeFilter !== 'Todos') {
            filtered = cars.filter(car => car.status === activeFilter);
        }
        if (searchTerm) {
            filtered = filtered.filter(car => 
                car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return [...filtered].sort((a, b) => {
            switch (sortOrder) {
                case 'price-desc': return b.price - a.price;
                case 'price-asc': return a.price - b.price;
                case 'km-desc': return b.km - a.km;
                case 'km-asc': return a.km - b.km;
                default: return 0;
            }
        });
    }, [cars, activeFilter, sortOrder, searchTerm]);

    const FilterButton = ({ label, filter, currentFilter, setFilter }) => {
        const isActive = currentFilter === filter;
        return ( <button onClick={() => setFilter(filter)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' }`}>{label}</button> );
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Mis Coches</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <FilterButton label="Todos" filter="Todos" currentFilter={activeFilter} setFilter={setActiveFilter} />
                    <FilterButton label="En Venta" filter="En venta" currentFilter={activeFilter} setFilter={setActiveFilter} />
                    <FilterButton label="Reservado" filter="Reservado" currentFilter={activeFilter} setFilter={setActiveFilter} />
                    <FilterButton label="Vendido" filter="Vendido" currentFilter={activeFilter} setFilter={setActiveFilter} />
                    <div className="w-48">
                        <Select
                            value={sortOrder}
                            onChange={setSortOrder}
                            options={sortOptions}
                        />
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Buscar por matrícula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 pl-10" />
                        <FontAwesomeIcon icon={faSearch} className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>
                <button onClick={onAddClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <FontAwesomeIcon icon={faPlusCircle} className="w-5 h-5" />
                    <span className="hidden sm:inline">Añadir Coche</span>
                </button>
            </div>
            {cars.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCars.map(car => (
                            <CarCard 
                                key={car.id} 
                                car={car} 
                                onSellClick={onSellClick} 
                                onReserveClick={onReserveClick} 
                                onCancelReservationClick={onCancelReservationClick} 
                                onViewDetailsClick={onViewDetailsClick} 
                                onAddIncidentClick={onAddIncidentClick} 
                                hasIncident={incidents.some(inc => inc.licensePlate === car.licensePlate && inc.status === 'abierta')} 
                            />
                        ))}
                    </div>
                    {/* --- ESTE ES EL CAMBIO --- */}
                    {/* Añadimos un espacio al final, que solo es visible en pantallas con el menú inferior */}
                    <div className="h-24 lg:hidden"></div>
                </>
            ) : (
                <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <FontAwesomeIcon icon={faCar} className="text-5xl text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Aún no tienes coches registrados</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Empieza por añadir tu primer vehículo a la lista.</p>
                    <button onClick={onAddClick} className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                        <FontAwesomeIcon icon={faPlusCircle} />
                        Añadir mi primer coche
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyCars;