// autogest-app/frontend/src/components/modals/FilterModal.jsx
import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes, faMapMarkerAlt, faUndo } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';

const FilterModal = ({ isOpen, onClose, cars, filters, setFilters, resetFilters }) => {
    if (!isOpen) return null;

    const makeOptions = useMemo(() =>
        [...new Set(cars.map(car => car.make))].sort((a, b) => a.localeCompare(b)).map(make => ({ id: make, name: make })),
    [cars]);

    const statusOptions = useMemo(() =>
        [...new Set(cars.map(car => car.status))].sort().map(status => ({ id: status, name: status })),
    [cars]);

    const locationOptions = useMemo(() => {
        const uniqueLocations = cars.reduce((acc, car) => {
            if (car.location) {
                const trimmedLocation = car.location.trim();
                const lowerCaseLocation = trimmedLocation.toLowerCase();
                if (trimmedLocation && !acc.has(lowerCaseLocation)) {
                    acc.set(lowerCaseLocation, trimmedLocation);
                }
            }
            return acc;
        }, new Map());
        
        return [...uniqueLocations.values()]
            .sort((a, b) => a.localeCompare(b))
            .map(location => ({ id: location, name: location }));
    }, [cars]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-gray-300 overflow-hidden">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faFilter} className="text-white w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Filtrar Vehículos</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-5 bg-white no-scrollbar">
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
                    {locationOptions.length > 0 && (
                        <Select
                            label="Ubicación"
                            value={filters.location}
                            onChange={(value) => handleSelectChange('location', value)}
                            options={[{ id: '', name: 'Todas' }, ...locationOptions]}
                            icon={faMapMarkerAlt}
                        />
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="minPrice" className="block text-sm font-bold text-gray-700 mb-1 uppercase">Precio Mín.</label>
                           <input 
                                type="number" 
                                name="minPrice" 
                                id="minPrice" 
                                value={filters.minPrice} 
                                onChange={handleInputChange} 
                                placeholder="€" 
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors"
                            />
                        </div>
                        <div>
                           <label htmlFor="maxPrice" className="block text-sm font-bold text-gray-700 mb-1 uppercase">Precio Máx.</label>
                           <input 
                                type="number" 
                                name="maxPrice" 
                                id="maxPrice" 
                                value={filters.maxPrice} 
                                onChange={handleInputChange} 
                                placeholder="€" 
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors"
                            />
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="minKm" className="block text-sm font-bold text-gray-700 mb-1 uppercase">KM Mín.</label>
                           <input 
                                type="number" 
                                name="minKm" 
                                id="minKm" 
                                value={filters.minKm} 
                                onChange={handleInputChange} 
                                placeholder="km" 
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors"
                            />
                        </div>
                        <div>
                           <label htmlFor="maxKm" className="block text-sm font-bold text-gray-700 mb-1 uppercase">KM Máx.</label>
                           <input 
                                type="number" 
                                name="maxKm" 
                                id="maxKm" 
                                value={filters.maxKm} 
                                onChange={handleInputChange} 
                                placeholder="km" 
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Gris Claro */}
                <div className="flex-shrink-0 mt-auto flex justify-between items-center gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={resetFilters} 
                        className="text-sm text-accent font-bold hover:text-accent-hover transition-colors flex items-center gap-2 uppercase px-2"
                    >
                        <FontAwesomeIcon icon={faUndo} className="w-3 h-3" />
                        Limpiar filtros
                    </button>
                    <button 
                        onClick={onClose} 
                        className="bg-accent text-white px-8 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;