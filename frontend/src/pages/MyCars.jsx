// autogest-app/frontend/src/pages/MyCars.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faTimes, faFilter, faCalendarAlt, faRoad, faGasPump, faCogs, faHandHoldingUsd, faBell, faBan, faTags, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import Select from '../components/Select';
import FilterModal from '../components/modals/FilterModal';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const ToggleSwitch = ({ enabled, onChange }) => (
    <button
        type="button"
        onClick={(e) => {
            e.stopPropagation(); // Evita que se abra el modal de detalles
            onChange();
        }}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${enabled ? 'bg-accent' : 'bg-zinc-200 dark:bg-zinc-700'}`}
    >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

// Componente de Tarjeta de Coche
const CarCard = ({ car, onViewDetailsClick, onSellClick, onReserveClick, onCancelReservationClick, onUpdateInsurance }) => {
    const getStatusChipClass = (status) => {
        switch (status) {
            case 'Vendido': return 'bg-green-accent/10 text-green-accent';
            case 'En venta': return 'bg-blue-accent/10 text-blue-accent';
            case 'Reservado': return 'bg-yellow-accent/10 text-yellow-accent';
            default: return 'bg-component-bg-hover text-text-secondary';
        }
    };

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

    const visibleTags = tagsToShow.slice(0, 3);
    const hiddenTagsCount = tagsToShow.length - visibleTags.length;
    const imageUrl = car.imageUrl ? `${API_BASE_URL}${car.imageUrl}` : `https://placehold.co/400x300/f1f3f5/6c757d?text=${car.make}+${car.model}`;

    return (
        <div className="bg-component-bg rounded-lg shadow-sm border border-border-color overflow-hidden flex flex-col sm:flex-row transition-shadow duration-300 hover:shadow-lg">
            <div className="sm:w-1/3 lg:w-1/4 flex-shrink-0">
                <img
                    src={imageUrl}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-48 sm:h-full object-cover cursor-pointer"
                    onClick={() => onViewDetailsClick(car)}
                />
            </div>
            <div className="p-4 flex-grow flex flex-col sm:w-2/3 lg:w-3/4">
                <div className="flex items-start justify-between mb-1">
                    <div>
                        <h3 className="text-xl font-bold text-text-primary truncate">{car.make} {car.model}</h3>
                        <p className="text-sm text-text-secondary">{car.licensePlate}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${getStatusChipClass(car.status)} ml-2`}>
                        {car.status}
                    </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm text-text-secondary my-4">
                    <div className="flex items-center gap-2 truncate" title={`${new Intl.NumberFormat('es-ES').format(car.km)} km`}>
                        <FontAwesomeIcon icon={faRoad} className="w-4 h-4" />
                        <span>{car.km ? `${new Intl.NumberFormat('es-ES').format(car.km)} km` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate" title={car.registrationDate ? new Date(car.registrationDate).getFullYear() : 'N/A'}>
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                        <span>{car.registrationDate ? new Date(car.registrationDate).getFullYear() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate" title={car.fuel || 'N/A'}>
                        <FontAwesomeIcon icon={faGasPump} className="w-4 h-4" />
                        <span>{car.fuel || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate" title={car.transmission || 'N/A'}>
                        <FontAwesomeIcon icon={faCogs} className="w-4 h-4" />
                        <span>{car.transmission || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2" title={`Seguro: ${car.hasInsurance ? 'Sí' : 'No'}`}>
                        <FontAwesomeIcon icon={faShieldAlt} className="w-4 h-4 flex-shrink-0" />
                        <ToggleSwitch 
                            enabled={car.hasInsurance} 
                            onChange={() => onUpdateInsurance(car, !car.hasInsurance)}
                        />
                    </div>
                </div>

                {tagsToShow.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <FontAwesomeIcon icon={faTags} className="w-4 h-4 text-text-secondary" />
                        {visibleTags.map(tag => (
                            <span key={tag} className="bg-accent/10 text-accent text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>
                        ))}
                        {hiddenTagsCount > 0 && (
                            <span className="text-xs font-semibold text-text-secondary px-2 py-1 rounded-full bg-component-bg-hover">+{hiddenTagsCount} más</span>
                        )}
                    </div>
                )}


                <div className="mt-auto flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border-color">
                    <div className="text-center sm:text-left w-full sm:w-auto">
                        <p className="text-xs text-text-secondary">Precio Venta</p>
                        <p className="text-3xl font-extrabold text-accent">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}
                        </p>
                        <p className="text-xs text-text-secondary mt-2">
                            Compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                        </p>
                        {car.status === 'Vendido' && car.salePrice > 0 && (
                            <p className="text-sm font-semibold text-green-accent mt-1">
                                Venta Final: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}
                            </p>
                        )}
                        {car.status === 'Reservado' && car.reservationDeposit > 0 && (
                            <p className="text-sm font-semibold text-yellow-accent mt-1">
                                Reserva: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.reservationDeposit)}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => onViewDetailsClick(car)}
                            className="flex-1 sm:flex-initial bg-component-bg-hover text-accent font-semibold py-2 px-4 rounded-lg border border-border-color hover:bg-border-color transition-colors"
                        >
                            Detalles
                        </button>
                         {(car.status === 'En venta' || car.status === 'Reservado') && (
                            <button onClick={() => onSellClick(car)} className="p-2 aspect-square text-green-accent bg-green-accent/10 rounded-lg hover:bg-green-accent/20 flex items-center justify-center transition-colors" title="Vender">
                                <FontAwesomeIcon icon={faHandHoldingUsd} />
                            </button>
                        )}
                        {car.status === 'En venta' && (
                            <button onClick={() => onReserveClick(car)} className="p-2 aspect-square text-yellow-accent bg-yellow-accent/10 rounded-lg hover:bg-yellow-accent/20 flex items-center justify-center transition-colors" title="Reservar">
                               <FontAwesomeIcon icon={faBell} />
                            </button>
                        )}
                        {car.status === 'Reservado' && (
                             <button onClick={() => onCancelReservationClick(car)} className="p-2 aspect-square text-red-accent bg-red-accent/10 rounded-lg hover:bg-red-accent/20 flex items-center justify-center transition-colors" title="Cancelar Reserva">
                                <FontAwesomeIcon icon={faBan} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente para los Filtros en Sidebar (para escritorio)
const FilterSidebar = ({ cars, filters, setFilters, resetFilters }) => {
    const makeOptions = useMemo(() => 
        [...new Set(cars.map(car => car.make))].map(make => ({ id: make, name: make })), 
    [cars]);

    const statusOptions = useMemo(() => 
        [...new Set(cars.map(car => car.status))].map(status => ({ id: status, name: status })), 
    [cars]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSelectChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-component-bg p-6 rounded-lg shadow-sm border border-border-color">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} />
                Filtros
            </h3>
            <div className="space-y-4">
                <Select
                    label="Marca"
                    value={filters.make}
                    onChange={(value) => handleSelectChange('make', value)}
                    options={[{ id: '', name: 'Todas' }, ...makeOptions]}
                />
                <Select
                    label="Estado"
                    value={filters.status}
                    onChange={(value) => handleSelectChange('status', value)}
                    options={[{ id: '', name: 'Todos' }, ...statusOptions]}
                />
                <div className="grid grid-cols-2 gap-2">
                    <div>
                       <label htmlFor="minPriceDesktop" className="block text-sm font-medium text-text-secondary mb-1">Precio Mín.</label>
                       <input type="number" name="minPrice" id="minPriceDesktop" value={filters.minPrice} onChange={handleInputChange} placeholder="€" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent"/>
                    </div>
                    <div>
                       <label htmlFor="maxPriceDesktop" className="block text-sm font-medium text-text-secondary mb-1">Precio Máx.</label>
                       <input type="number" name="maxPrice" id="maxPriceDesktop" value={filters.maxPrice} onChange={handleInputChange} placeholder="€" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent"/>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                       <label htmlFor="minKmDesktop" className="block text-sm font-medium text-text-secondary mb-1">KM Mín.</label>
                       <input type="number" name="minKm" id="minKmDesktop" value={filters.minKm} onChange={handleInputChange} placeholder="km" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent"/>
                    </div>
                    <div>
                       <label htmlFor="maxKmDesktop" className="block text-sm font-medium text-text-secondary mb-1">KM Máx.</label>
                       <input type="number" name="maxKm" id="maxKmDesktop" value={filters.maxKm} onChange={handleInputChange} placeholder="km" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent"/>
                    </div>
                </div>
                <button onClick={resetFilters} className="w-full text-sm text-accent hover:underline pt-2">
                    Limpiar filtros
                </button>
            </div>
        </div>
    );
};

// Componente Principal
const MyCars = ({ cars, onAddClick, onViewDetailsClick, onSellClick, onReserveClick, onCancelReservationClick, onUpdateInsurance }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        make: '', status: '', minPrice: '', maxPrice: '', minKm: '', maxKm: ''
    });

    const location = useLocation();

    useEffect(() => {
        const carIdToOpen = location.state?.carIdToOpen;
        if (carIdToOpen) {
            const carToOpen = cars.find(c => c.id === carIdToOpen);
            if (carToOpen) {
                onViewDetailsClick(carToOpen);
                window.history.replaceState({}, document.title)
            }
        }
    }, [location.state, cars, onViewDetailsClick]);


    const resetFilters = () => {
        setFilters({ make: '', status: '', minPrice: '', maxPrice: '', minKm: '', maxKm: '' });
        setSearchTerm('');
    };

    const filteredCars = useMemo(() => {
        return cars.filter(car => {
            const searchMatch = `${car.make} ${car.model} ${car.licensePlate}`.toLowerCase().includes(searchTerm.toLowerCase());
            const makeMatch = filters.make ? car.make === filters.make : true;
            const statusMatch = filters.status ? car.status === filters.status : true;
            const minPriceMatch = filters.minPrice ? car.price >= parseFloat(filters.minPrice) : true;
            const maxPriceMatch = filters.maxPrice ? car.price <= parseFloat(filters.maxPrice) : true;
            const minKmMatch = filters.minKm ? car.km >= parseFloat(filters.minKm) : true;
            const maxKmMatch = filters.maxKm ? car.km <= parseFloat(filters.maxKm) : true;
            
            return searchMatch && makeMatch && statusMatch && minPriceMatch && maxPriceMatch && minKmMatch && maxKmMatch;
        });
    }, [cars, searchTerm, filters]);

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
                    <FilterSidebar cars={cars} filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
                </aside>
                
                <main className="flex-1 space-y-6 min-w-0">
                     <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:flex-grow">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input
                                type="text"
                                placeholder="Buscar por marca, modelo, matrícula..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 bg-component-bg border border-border-color rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setFilterModalOpen(true)}
                                className="w-1/2 sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg border border-border-color hover:bg-border-color transition-colors lg:hidden"
                            >
                                <FontAwesomeIcon icon={faFilter} />
                                <span>Filtros</span>
                            </button>
                            <button
                                onClick={onAddClick}
                                className="w-1/2 sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-accent text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-accent-hover transition-colors"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Añadir</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {filteredCars.map(car => (
                            <CarCard 
                                key={car.id} 
                                car={car}
                                onViewDetailsClick={onViewDetailsClick}
                                onSellClick={onSellClick}
                                onReserveClick={onReserveClick}
                                onCancelReservationClick={onCancelReservationClick}
                                onUpdateInsurance={onUpdateInsurance}
                            />
                        ))}
                    </div>
        
                    {filteredCars.length === 0 && (
                        <div className="text-center py-12 bg-component-bg rounded-lg border border-border-color">
                            <p className="text-text-secondary">No se han encontrado coches con los filtros actuales.</p>
                        </div>
                    )}
                </main>
            </div>
            
            <FilterModal 
                isOpen={isFilterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                cars={cars}
                filters={filters}
                setFilters={setFilters}
                resetFilters={resetFilters}
            />
        </>
    );
};

export default MyCars;