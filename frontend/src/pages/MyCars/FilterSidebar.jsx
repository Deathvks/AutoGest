// autogest-app/frontend/src/pages/MyCars/FilterSidebar.jsx
import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
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

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se utiliza una lógica más robusta para obtener ubicaciones únicas,
    // insensible a mayúsculas/minúsculas y espacios extra.
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
    // --- FIN DE LA MODIFICACIÓN ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    const handleSelectChange = (name, value) => setFilters(prev => ({ ...prev, [name]: value }));

    return (
        <div className="bg-component-bg p-6 rounded-lg shadow-sm border border-border-color">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} />
                Filtros
            </h3>
            <div className="space-y-4">
                <Select label="Marca" value={filters.make} onChange={(value) => handleSelectChange('make', value)} options={[{ id: '', name: 'Todas' }, ...makeOptions]} />
                <Select label="Estado" value={filters.status} onChange={(value) => handleSelectChange('status', value)} options={[{ id: '', name: 'Todos' }, ...statusOptions]} />
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                {locationOptions.length > 0 ? (
                    <Select
                        label="Ubicación"
                        value={filters.location}
                        onChange={(value) => handleSelectChange('location', value)}
                        options={[{ id: '', name: 'Todas' }, ...locationOptions]}
                        icon={faMapMarkerAlt}
                    />
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Ubicación</label>
                        <div className="text-xs text-text-secondary bg-background p-2 rounded-md border border-border-color">
                            Añade un coche con una ubicación para poder filtrar.
                        </div>
                    </div>
                )}
                {/* --- FIN DE LA MODIFICACIÓN --- */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="minPriceDesktop" className="block text-sm font-medium text-text-secondary mb-1">Precio Mín.</label>
                        <input type="number" name="minPrice" id="minPriceDesktop" value={filters.minPrice} onChange={handleInputChange} placeholder="€" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent" />
                    </div>
                    <div>
                        <label htmlFor="maxPriceDesktop" className="block text-sm font-medium text-text-secondary mb-1">Precio Máx.</label>
                        <input type="number" name="maxPrice" id="maxPriceDesktop" value={filters.maxPrice} onChange={handleInputChange} placeholder="€" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="minKmDesktop" className="block text-sm font-medium text-text-secondary mb-1">KM Mín.</label>
                        <input type="number" name="minKm" id="minKmDesktop" value={filters.minKm} onChange={handleInputChange} placeholder="km" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent" />
                    </div>
                    <div>
                        <label htmlFor="maxKmDesktop" className="block text-sm font-medium text-text-secondary mb-1">KM Máx.</label>
                        <input type="number" name="maxKm" id="maxKmDesktop" value={filters.maxKm} onChange={handleInputChange} placeholder="km" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent" />
                    </div>
                </div>
                <button onClick={resetFilters} className="w-full text-sm text-accent hover:underline pt-2">Limpiar filtros</button>
            </div>
        </div>
    );
};

export default FilterSidebar;