// autogest-app/frontend/src/pages/MyCars.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';
import FilterModal from '../components/modals/FilterModal';
import CarCard from './MyCars/CarCard';
import FilterSidebar from './MyCars/FilterSidebar';

const MyCars = ({ cars, onAddClick, onViewDetailsClick, onSellClick, onReserveClick, onCancelReservationClick, onUpdateInsurance, onAddIncidentClick }) => {
  // --- INICIO DE LA MODIFICACIÓN ---
  const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem('carSearchTerm') || '');
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    const savedFilters = sessionStorage.getItem('carFilters');
    return savedFilters ? JSON.parse(savedFilters) : { make: '', status: '', location: '', minPrice: '', maxPrice: '', minKm: '', maxKm: '' };
  });
  // --- FIN DE LA MODIFICACIÓN ---
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

  // --- INICIO DE LA MODIFICACIÓN ---
  useEffect(() => {
    sessionStorage.setItem('carSearchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem('carFilters', JSON.stringify(filters));
  }, [filters]);

  const resetFilters = () => {
    setFilters({ make: '', status: '', location: '', minPrice: '', maxPrice: '', minKm: '', maxKm: '' });
    setSearchTerm('');
    sessionStorage.removeItem('carFilters');
    sessionStorage.removeItem('carSearchTerm');
  };
  // --- FIN DE LA MODIFICACIÓN ---

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const searchMatch = `${car.make} ${car.model} ${car.licensePlate}`.toLowerCase().includes(searchTerm.toLowerCase());
      const makeMatch = filters.make ? car.make === filters.make : true;
      const statusMatch = filters.status ? car.status === filters.status : car.status !== 'Vendido';
      const locationMatch = filters.location ? car.location === filters.location : true;
      const minPriceMatch = filters.minPrice ? car.price >= parseFloat(filters.minPrice) : true;
      const maxPriceMatch = filters.maxPrice ? car.price <= parseFloat(filters.maxPrice) : true;
      const minKmMatch = filters.minKm ? car.km >= parseFloat(filters.minKm) : true;
      const maxKmMatch = filters.maxKm ? car.km <= parseFloat(filters.maxKm) : true;
      return searchMatch && makeMatch && statusMatch && locationMatch && minPriceMatch && maxPriceMatch && minKmMatch && maxKmMatch;
    });
  }, [cars, searchTerm, filters]);

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-8">
        <aside className="hidden xl:block xl:w-80 flex-shrink-0">
          <FilterSidebar cars={cars} filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
        </aside>

        <main className="flex-1 space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:flex-grow">
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary z-10" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo, matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-component-bg backdrop-blur-lg border border-border-color rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder:text-text-secondary"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setFilterModalOpen(true)}
                className="flex-1 sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-component-bg-hover text-text-primary font-semibold px-4 py-3 rounded-xl border border-border-color hover:bg-border-color transition-colors xl:hidden"
              >
                <FontAwesomeIcon icon={faFilter} />
                <span>Filtros</span>
              </button>
              <button
                onClick={onAddClick}
                className="flex-1 sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-component-bg-hover text-text-primary font-semibold px-4 py-3 rounded-xl border border-border-color hover:bg-border-color transition-colors"
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
            <div className="text-center py-16 px-4 bg-component-bg backdrop-blur-lg rounded-2xl border border-border-color shadow-2xl">
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