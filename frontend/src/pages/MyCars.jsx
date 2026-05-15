// autogest-app/frontend/src/pages/MyCars.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';
import FilterModal from '../components/modals/FilterModal';
import CarCard from './MyCars/CarCard';
import FilterSidebar from './MyCars/FilterSidebar';

const MyCars = ({ cars, onAddClick, onViewDetailsClick, onSellClick, onReserveClick, onCancelReservationClick, onUpdateInsurance, onAddIncidentClick }) => {
  const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem('carSearchTerm') || '');
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    const savedFilters = sessionStorage.getItem('carFilters');
    return savedFilters ? JSON.parse(savedFilters) : { make: '', status: '', location: '', minPrice: '', maxPrice: '', minKm: '', maxKm: '' };
  });

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
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo, matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-[14px] focus:ring-2 focus:ring-[#020B1C] focus:border-[#020B1C] transition shadow-sm placeholder:text-gray-400 text-gray-800 outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#020B1C] transition-colors">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setFilterModalOpen(true)}
                className="flex-1 sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-white text-gray-700 font-bold px-4 py-3 rounded-[14px] border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm xl:hidden uppercase text-sm"
              >
                <FontAwesomeIcon icon={faFilter} />
                <span>Filtros</span>
              </button>

              {/* Botón normal de escritorio oculto en móvil */}
              <button
                onClick={onAddClick}
                className="hidden sm:flex flex-1 sm:w-auto flex-shrink-0 items-center justify-center gap-2 bg-[#ED123A] text-white font-bold px-5 py-3 rounded-[14px] shadow-md hover:bg-[#C90E30] hover:-translate-y-0.5 transition-all uppercase text-sm"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          <div className="pb-4 border-b border-gray-200">
            <h2 className="text-lg font-extrabold text-[#020B1C] uppercase tracking-wide">
              {filteredCars.length} Vehículos
              <span className="text-sm font-medium text-gray-500 ml-2 lowercase">(de {cars.length} en total)</span>
            </h2>
          </div>

          <div className="space-y-6 pb-10">
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
            <div className="text-center py-16 px-4 bg-white rounded-[14px] border border-gray-200 border-dashed shadow-sm">
              <p className="text-gray-500 font-medium">No se han encontrado coches con los filtros actuales.</p>
            </div>
          )}
        </main>
      </div>

      {/* --- BOTÓN FLOTANTE PARA MÓVIL --- */}
      <button
        onClick={onAddClick}
        className="sm:hidden fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#ED123A] text-white rounded-full shadow-[0_4px_14px_rgba(237,18,58,0.4)] hover:bg-[#C90E30] hover:scale-105 active:scale-95 transition-all"
        aria-label="Añadir coche"
      >
        <FontAwesomeIcon icon={faPlus} className="w-6 h-6" />
      </button>

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