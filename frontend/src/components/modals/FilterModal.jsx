// autogest-app/frontend/src/components/modals/FilterModal.jsx
import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';

const FilterModal = ({ isOpen, onClose, cars, filters, setFilters, resetFilters }) => {
    if (!isOpen) return null;

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} />
                        Filtros
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="minPrice" className="block text-sm font-medium text-text-secondary mb-1">Precio Mín.</label>
                           <input type="number" name="minPrice" id="minPrice" value={filters.minPrice} onChange={handleInputChange} placeholder="€" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent"/>
                        </div>
                        <div>
                           <label htmlFor="maxPrice" className="block text-sm font-medium text-text-secondary mb-1">Precio Máx.</label>
                           <input type="number" name="maxPrice" id="maxPrice" value={filters.maxPrice} onChange={handleInputChange} placeholder="€" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="minKm" className="block text-sm font-medium text-text-secondary mb-1">KM Mín.</label>
                           <input type="number" name="minKm" id="minKm" value={filters.minKm} onChange={handleInputChange} placeholder="km" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent"/>
                        </div>
                        <div>
                           <label htmlFor="maxKm" className="block text-sm font-medium text-text-secondary mb-1">KM Máx.</label>
                           <input type="number" name="maxKm" id="maxKm" value={filters.maxKm} onChange={handleInputChange} placeholder="km" className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent"/>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-between items-center gap-4 p-4 border-t border-border-color">
                    <button onClick={resetFilters} className="text-sm text-accent hover:underline">
                        Limpiar filtros
                    </button>
                    <button onClick={onClose} className="bg-accent text-white px-6 py-2 rounded-lg shadow-sm hover:bg-accent-hover transition-colors font-semibold">
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;