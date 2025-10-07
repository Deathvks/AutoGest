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
        <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-border-color">
            <h3 className="font-bold text-text-primary mb-6 flex items-center gap-2 text-lg">
                <FontAwesomeIcon icon={faFilter} />
                Filtros
            </h3>
            <div className="space-y-4">
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
                        <label htmlFor="minPriceDesktop" className="block text-sm font-medium text-text-secondary mb-1">Precio Mín.</label>
                        <input type="number" name="minPrice" id="minPriceDesktop" value={filters.minPrice} onChange={handleInputChange} placeholder="€" className="w-full px-3 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent text-text-primary placeholder:text-text-secondary" />
                    </div>
                    <div>
                        <label htmlFor="maxPriceDesktop" className="block text-sm font-medium text-text-secondary mb-1">Precio Máx.</label>
                        <input type="number" name="maxPrice" id="maxPriceDesktop" value={filters.maxPrice} onChange={handleInputChange} placeholder="€" className="w-full px-3 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent text-text-primary placeholder:text-text-secondary" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="minKmDesktop" className="block text-sm font-medium text-text-secondary mb-1">KM Mín.</label>
                        <input type="number" name="minKm" id="minKmDesktop" value={filters.minKm} onChange={handleInputChange} placeholder="km" className="w-full px-3 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent text-text-primary placeholder:text-text-secondary" />
                    </div>
                    <div>
                        <label htmlFor="maxKmDesktop" className="block text-sm font-medium text-text-secondary mb-1">KM Máx.</label>
                        <input type="number" name="maxKm" id="maxKmDesktop" value={filters.maxKm} onChange={handleInputChange} placeholder="km" className="w-full px-3 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent text-text-primary placeholder:text-text-secondary" />
                    </div>
                </div>

                <div className="pt-4">
                    <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 text-sm text-accent font-semibold hover:text-accent-hover transition-colors">
                        <FontAwesomeIcon icon={faUndo} />
                        Limpiar filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;