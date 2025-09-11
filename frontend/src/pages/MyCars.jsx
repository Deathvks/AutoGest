// autogest-app/frontend/src/pages/MyCars.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';
import FilterModal from '../components/modals/FilterModal';
import CarCard from './MyCars/CarCard';
import FilterSidebar from './MyCars/FilterSidebar';

const MyCars = ({ cars, onAddClick, onViewDetailsClick, onSellClick, onReserveClick, onCancelReservationClick, onUpdateInsurance, onAddIncidentClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({ make: '', status: '', minPrice: '', maxPrice: '', minKm: '', maxKm: '' });
  const location = useLocation();

  useEffect(() => {
    const carIdToOpen = location.state?.carIdToOpen;
    if (carIdToOpen) {
      const carToOpen = cars.find(c => c.id === carIdToOpen);
      if (carToOpen) {
        onViewDetailsClick(carToOpen);
        window.history.replaceState({}, document.title);
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

        <main className="flex-1 space-y-6 min-w-0 max-w-5xl 2xl:max-w-6xl lg:pr-12 xl:pr-16">
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

          <div className="pb-4 border-b border-border-color">
            <h2 className="text-lg font-bold text-text-primary">
              {filteredCars.length} Vehículos
              <span className="text-sm font-medium text-text-secondary ml-2">(de {cars.length} en total)</span>
            </h2>
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
                onAddIncidentClick={onAddIncidentClick}
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