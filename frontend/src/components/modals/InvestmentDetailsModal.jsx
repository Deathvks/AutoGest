// autogest-app/frontend/src/components/modals/InvestmentDetailsModal.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// --- INICIO DE LA MODIFICACIÓN ---
import { faTimes, faCar, faWrench, faChevronLeft, faChevronRight, faHandHoldingDollar } from '@fortawesome/free-solid-svg-icons';
// --- FIN DE LA MODIFICACIÓN ---

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
        
        // --- INICIO DE LA MODIFICACIÓN ---
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
        // --- FIN DE LA MODIFICACIÓN ---
    }, [isOpen, cars, expenses]);

    const totalInvestment = useMemo(() => {
        // --- INICIO DE LA MODIFICACIÓN ---
        // El total es la suma de débitos menos la suma de créditos
        return allInvestments.reduce((sum, item) => {
            return sum + (item.isDebit ? item.amount : -item.amount);
        }, 0);
        // --- FIN DE LA MODIFICACIÓN ---
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

    // --- INICIO DE LA MODIFICACIÓN ---
    const getItemIcon = (item) => {
        if (item.type === 'Compra de vehículo') return faCar;
        if (item.type === 'Coste recuperado por venta') return faHandHoldingDollar;
        return faWrench;
    };
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary">Desglose de Inversión</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    <div className="space-y-4">
                        {currentInvestments.length > 0 ? (
                            currentInvestments.map((item, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => handleItemClick(item)}
                                    className="flex items-center justify-between p-3 bg-background rounded-lg cursor-pointer hover:bg-border-color transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                                        <FontAwesomeIcon icon={getItemIcon(item)} className="w-5 h-5 text-text-secondary" />
                                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                                        <div>
                                            <p className="font-semibold text-text-primary">{item.description}</p>
                                            <p className="text-sm text-text-secondary">{item.type} - {new Date(item.date).toLocaleDateString('es-ES')}</p>
                                        </div>
                                    </div>
                                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                                    <p className={`font-bold ${item.isDebit ? 'text-red-accent' : 'text-green-accent'}`}>
                                        {item.isDebit ? '- ' : '+ '}
                                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.amount)}
                                    </p>
                                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-text-secondary py-4">No hay inversiones registradas.</p>
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
                    <span className="text-lg font-bold text-text-primary">Inversión Neta Actual:</span>
                    <span className="text-2xl font-extrabold text-red-accent">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalInvestment)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default InvestmentDetailsModal;