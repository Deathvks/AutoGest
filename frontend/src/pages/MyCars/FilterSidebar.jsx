// autogest-app/frontend/src/pages/MyCars/FilterSidebar.jsx
import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faMapMarkerAlt, faUndo } from '@fortawesome/free-solid-svg-icons';
import Select from '../../components/Select';

const FilterSidebar = ({ cars, filters, setFilters, resetFilters }) => {
    const makeOptions = useMemo(() => {
        const uniqueMakes = cars.reduce((acc, car) => {
            if (car.make) {
                const trimmedMake = car.make.trim();
                const lowerCaseMake = trimmedMake.toLowerCase();
                if (trimmedMake && !acc.has(lowerCaseMake)) {
                    acc.set(lowerCaseMake, trimmedMake);
                }
            }
            return acc;
        }, new Map());
        
        return [...uniqueMakes.values()]
            .sort((a, b) => a.localeCompare(b))
            .map(make => ({ id: make, name: make }));
    }, [cars]);

    const statusOptions = useMemo(() => 
        [...new Set(cars.map(car => car.status))]
            .sort()
            .map(status => ({ id: status, name: status })), 
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
    const handleSelectChange = (name, value) => setFilters(prev => ({ ...prev, [name]: value }));

    return (
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
            {/* Header Rojo Occident */}
            <div className="bg-accent px-6 py-4 flex items-center gap-3 text-white">
                <FontAwesomeIcon icon={faFilter} />
                <h3 className="font-bold text-lg uppercase tracking-wide">Filtros</h3>
            </div>

            <div className="p-6 space-y-4">
                <Select label="Marca" value={filters.make} onChange={(value) => handleSelectChange('make', value)} options={[{ id: '', name: 'Todas' }, ...makeOptions]} />
                <Select label="Estado" value={filters.status} onChange={(value) => handleSelectChange('status', value)} options={[{ id: '', name: 'Todos' }, ...statusOptions]} />
                {locationOptions.length > 0 && (
                    <Select
                        label="Ubicación"
                        value={filters.location}
                        onChange={(value) => handleSelectChange('location', value)}
                        options={[{ id: '', name: 'Todas' }, ...locationOptions]}
                        icon={faMapMarkerAlt}
                    />
                )}
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                        <label htmlFor="minPriceDesktop" className="block text-sm font-bold text-gray-700 mb-1 uppercase">Precio Mín.</label>
                        <input 
                            type="number" 
                            name="minPrice" 
                            id="minPriceDesktop" 
                            value={filters.minPrice} 
                            onChange={handleInputChange} 
                            placeholder="€" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors" 
                        />
                    </div>
                    <div>
                        <label htmlFor="maxPriceDesktop" className="block text-sm font-bold text-gray-700 mb-1 uppercase">Precio Máx.</label>
                        <input 
                            type="number" 
                            name="maxPrice" 
                            id="maxPriceDesktop" 
                            value={filters.maxPrice} 
                            onChange={handleInputChange} 
                            placeholder="€" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="minKmDesktop" className="block text-sm font-bold text-gray-700 mb-1 uppercase">KM Mín.</label>
                        <input 
                            type="number" 
                            name="minKm" 
                            id="minKmDesktop" 
                            value={filters.minKm} 
                            onChange={handleInputChange} 
                            placeholder="km" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors" 
                        />
                    </div>
                    <div>
                        <label htmlFor="maxKmDesktop" className="block text-sm font-bold text-gray-700 mb-1 uppercase">KM Máx.</label>
                        <input 
                            type="number" 
                            name="maxKm" 
                            id="maxKmDesktop" 
                            value={filters.maxKm} 
                            onChange={handleInputChange} 
                            placeholder="km" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors" 
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 text-sm text-accent font-bold hover:text-accent-hover transition-colors uppercase">
                        <FontAwesomeIcon icon={faUndo} />
                        Limpiar filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;