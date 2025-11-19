// autogest-app/frontend/src/components/modals/RevenueDetailsModal.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCar, faChevronLeft, faChevronRight, faChartLine } from '@fortawesome/free-solid-svg-icons';

const RevenueDetailsModal = ({ isOpen, onClose, cars }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    const soldCars = useMemo(() => {
        if (!isOpen) return [];
        return cars
            .filter(car => car.status === 'Vendido' && car.salePrice > 0)
            .sort((a, b) => new Date(b.saleDate || b.updatedAt) - new Date(a.saleDate || a.updatedAt));
    }, [isOpen, cars]);

    const totalRevenue = useMemo(() => {
        return soldCars.reduce((sum, car) => sum + (parseFloat(car.salePrice) || 0), 0);
    }, [soldCars]);

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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-300 overflow-hidden">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                             <FontAwesomeIcon icon={faChartLine} className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Desglose de Ingresos</h2>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors focus:outline-none">
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 no-scrollbar bg-white">
                    <div className="space-y-3">
                        {currentCars.length > 0 ? (
                            currentCars.map((car) => (
                                <div
                                    key={car.id}
                                    onClick={() => handleItemClick(car)}
                                    className="flex items-center justify-between p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 hover:border-accent shadow-sm group"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="p-2 bg-gray-50 rounded-full text-gray-500 group-hover:text-accent transition-colors">
                                            <FontAwesomeIcon icon={faCar} className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate text-sm uppercase">{`${car.make} ${car.model} (${car.licensePlate})`}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">Vendido el {new Date(car.saleDate || car.updatedAt).toLocaleDateString('es-ES')}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-base text-green-600 whitespace-nowrap">
                                        + {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}
                                    </p>
                                </div>
                            ))
                        ) : (
                             <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-gray-500 font-medium">No hay ingresos por ventas registrados.</p>
                            </div>
                        )}
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-t border-gray-200 bg-white">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 font-bold text-xs uppercase"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} /> Anterior
                        </button>
                        <span className="text-gray-500 font-bold text-xs uppercase">Página {currentPage} de {totalPages}</span>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 font-bold text-xs uppercase"
                        >
                            Siguiente <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                )}

                <div className="flex-shrink-0 mt-auto flex justify-between items-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
                    <span className="text-sm font-bold text-gray-600 uppercase">Total Ingresos</span>
                    <span className="text-2xl font-extrabold text-green-600">
                        + {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RevenueDetailsModal;