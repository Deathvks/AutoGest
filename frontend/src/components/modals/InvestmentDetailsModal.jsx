// autogest-app/frontend/src/components/modals/InvestmentDetailsModal.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCar, faWrench, faChevronLeft, faChevronRight, faHandHoldingDollar, faChartLine } from '@fortawesome/free-solid-svg-icons';

const InvestmentDetailsModal = ({ isOpen, onClose, cars, expenses }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    const allInvestments = useMemo(() => {
        if (!isOpen) return [];

        const carPurchases = cars.map(car => ({
            type: 'Compra de vehículo',
            date: car.createdAt,
            description: `${car.make} ${car.model} (${car.licensePlate})`,
            amount: parseFloat(car.purchasePrice) || 0,
            carId: car.id,
            isDebit: true,
        }));

        const otherExpenses = expenses.map(expense => ({
            type: expense.category,
            date: expense.date,
            description: `${expense.description || 'Gasto'} (${expense.carLicensePlate || 'General'})`,
            amount: parseFloat(expense.amount) || 0,
            carLicensePlate: expense.carLicensePlate,
            isDebit: true,
        }));
        
        const recoupedInvestments = cars
            .filter(car => car.status === 'Vendido')
            .map(car => ({
                type: 'Coste recuperado por venta',
                date: car.saleDate || car.updatedAt,
                description: `${car.make} ${car.model} (${car.licensePlate})`,
                amount: parseFloat(car.purchasePrice) || 0,
                carId: car.id,
                isDebit: false, // Esto es un crédito a la cuenta de inversión
            }));

        return [...carPurchases, ...otherExpenses, ...recoupedInvestments].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [isOpen, cars, expenses]);

    const totalInvestment = useMemo(() => {
        return allInvestments.reduce((sum, item) => {
            return sum + (item.isDebit ? item.amount : -item.amount);
        }, 0);
    }, [allInvestments]);

    const totalPages = Math.ceil(allInvestments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentInvestments = allInvestments.slice(startIndex, endIndex);

    const handleItemClick = (item) => {
        let carToOpen = null;
        if (item.carId) {
            carToOpen = cars.find(c => c.id === item.carId);
        } else if (item.carLicensePlate) {
            carToOpen = cars.find(c => c.licensePlate === item.carLicensePlate);
        }

        if (carToOpen) {
            onClose();
            navigate('/cars', { state: { carIdToOpen: carToOpen.id } });
        }
    };
    
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    if (!isOpen) return null;

    const getItemIcon = (item) => {
        if (item.type === 'Compra de vehículo') return faCar;
        if (item.type === 'Coste recuperado por venta') return faHandHoldingDollar;
        return faWrench;
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-300 overflow-hidden">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                             <FontAwesomeIcon icon={faChartLine} className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Desglose de Inversión</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20">
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 no-scrollbar bg-white">
                    <div className="space-y-3">
                        {currentInvestments.length > 0 ? (
                            currentInvestments.map((item, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => handleItemClick(item)}
                                    className="flex items-center justify-between p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 hover:border-accent shadow-sm group"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="p-2 bg-gray-50 rounded-full text-gray-500 group-hover:text-accent transition-colors">
                                             <FontAwesomeIcon icon={getItemIcon(item)} className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate text-sm">{item.description}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">{item.type} - {new Date(item.date).toLocaleDateString('es-ES')}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold text-base whitespace-nowrap ${item.isDebit ? 'text-red-600' : 'text-green-600'}`}>
                                        {item.isDebit ? '- ' : '+ '}
                                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.amount)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-gray-500 font-medium">No hay inversiones registradas.</p>
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
                    <span className="text-sm font-bold text-gray-600 uppercase">Inversión Neta Actual</span>
                    <span className="text-2xl font-extrabold text-red-600">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalInvestment)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default InvestmentDetailsModal;