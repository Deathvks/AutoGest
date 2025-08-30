// autogest-app/frontend/src/components/modals/RevenueDetailsModal.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCar, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const RevenueDetailsModal = ({ isOpen, onClose, cars }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    const soldCars = useMemo(() => {
        if (!isOpen) return [];
        return cars
            .filter(car => car.status === 'Vendido' && car.salePrice > 0)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [isOpen, cars]);

    const totalRevenue = useMemo(() => {
        return soldCars.reduce((sum, car) => sum + (parseFloat(car.salePrice) || 0), 0);
    }, [soldCars]);

    // Lógica de paginación
    const totalPages = Math.ceil(soldCars.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentCars = soldCars.slice(startIndex, endIndex);

    const handleItemClick = (car) => {
        if (car) {
            onClose();
            navigate('/cars', { state: { carIdToOpen: car.id } });
        }
    };

    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary">Desglose de Ingresos</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    <div className="space-y-4">
                        {currentCars.length > 0 ? (
                            currentCars.map((car) => (
                                <div
                                    key={car.id}
                                    onClick={() => handleItemClick(car)}
                                    className="flex items-center justify-between p-3 bg-background rounded-lg cursor-pointer hover:bg-border-color transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <FontAwesomeIcon icon={faCar} className="w-5 h-5 text-text-secondary" />
                                        <div>
                                            <p className="font-semibold text-text-primary">{`${car.make} ${car.model} (${car.licensePlate})`}</p>
                                            <p className="text-sm text-text-secondary">Vendido el {new Date(car.updatedAt).toLocaleDateString('es-ES')}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-green-accent">+ {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-text-secondary py-4">No hay ingresos por ventas registrados.</p>
                        )}
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-t border-border-color">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg bg-component-bg-hover text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border-color transition-colors"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" /> Anterior
                        </button>
                        <span className="text-text-secondary">Página {currentPage} de {totalPages}</span>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg bg-component-bg-hover text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border-color transition-colors"
                        >
                            Siguiente <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                        </button>
                    </div>
                )}

                <div className="flex-shrink-0 mt-auto flex justify-end items-center gap-4 p-4 border-t border-border-color">
                    <span className="text-lg font-bold text-text-primary">Total Ingresos:</span>
                    <span className="text-2xl font-extrabold text-green-accent">
                        + {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RevenueDetailsModal;