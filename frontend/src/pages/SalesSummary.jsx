// autogest-app/frontend/src/pages/SalesSummary.jsx
import React, { useMemo, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTags, faCar, faCalendarDay, faChevronLeft, faChevronRight, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CarPlaceholderImage from './MyCars/CarPlaceholderImage';
import { AuthContext } from '../context/AuthContext';

const SalesSummary = ({ cars, expenses, onViewDetailsClick }) => {
    const { user } = useContext(AuthContext);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const savedMonth = sessionStorage.getItem('salesSummaryMonth');
        return savedMonth ? new Date(savedMonth) : new Date();
    });
    const [viewMode, setViewMode] = useState(() => {
        return sessionStorage.getItem('salesSummaryViewMode') || 'monthly';
    }); // 'monthly' or 'all'
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const canViewSensitiveData = user.role === 'admin' || user.isOwner || !user.companyId;

    useEffect(() => {
        sessionStorage.setItem('salesSummaryMonth', currentMonth.toISOString());
    }, [currentMonth]);

    useEffect(() => {
        sessionStorage.setItem('salesSummaryViewMode', viewMode);
    }, [viewMode]);

    const changeMonth = (amount) => {
        setCurrentMonth(prevDate => {
            const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + amount, 1);
            const today = new Date();
            if (newDate > today) {
                return prevDate; // No avanzar más allá del mes actual
            }
            return newDate;
        });
    };

    const isNextMonthDisabled = useMemo(() => {
        const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        return nextMonth > new Date();
    }, [currentMonth]);

    const soldCarsWithProfit = useMemo(() => {
        return cars
            .filter(car => {
                if (car.status !== 'Vendido') return false;
                if (viewMode === 'monthly') {
                    const saleDate = new Date(car.saleDate || car.updatedAt);
                    return saleDate.getMonth() === currentMonth.getMonth() && saleDate.getFullYear() === currentMonth.getFullYear();
                }
                return true; // Modo 'all'
            })
            .map(car => {
                const associatedExpenses = expenses.filter(
                    exp => exp.carLicensePlate === car.licensePlate
                );
                const totalExpenses = associatedExpenses.reduce(
                    (sum, exp) => sum + (parseFloat(exp.amount) || 0),
                    0
                );

                if (!canViewSensitiveData) {
                    return { ...car, totalExpenses, profit: 0 };
                }
                
                const profit = (parseFloat(car.salePrice) || 0) - (parseFloat(car.purchasePrice) || 0) - totalExpenses;
                return { ...car, totalExpenses, profit };
            })
            .sort((a, b) => new Date(b.saleDate || b.updatedAt) - new Date(a.saleDate || a.updatedAt));
    }, [cars, expenses, currentMonth, viewMode, canViewSensitiveData]);

    // Paginación
    const totalPages = Math.ceil(soldCarsWithProfit.length / ITEMS_PER_PAGE);
    const paginatedCars = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return soldCarsWithProfit.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [soldCarsWithProfit, currentPage]);

    const generatePDF = () => {
        const doc = new jsPDF();
        let title = "Resumen de Todas las Ventas";
        let filename = "resumen_ventas_total.pdf";

        if (viewMode === 'monthly') {
            const monthName = currentMonth.toLocaleString('es-ES', { month: 'long' });
            const year = currentMonth.getFullYear();
            title = `Resumen de Ventas - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
            filename = `resumen_ventas_${monthName}_${year}.pdf`;
        }
        
        doc.text(title, 14, 16);
        
        const head = canViewSensitiveData
            ? [['Modelo', 'Matrícula', 'Precio Compra', 'Gastos', 'Precio Venta', 'Beneficio/Pérdida']]
            : [['Modelo', 'Matrícula', 'Gastos', 'Precio Venta']];

        const body = canViewSensitiveData
            ? soldCarsWithProfit.map(car => [
                `${car.make} ${car.model}`,
                car.licensePlate,
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice),
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.totalExpenses),
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice),
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.profit)
              ])
            : soldCarsWithProfit.map(car => [
                `${car.make} ${car.model}`,
                car.licensePlate,
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.totalExpenses),
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)
              ]);

        autoTable(doc, {
            startY: 20,
            head,
            body,
        });
        doc.save(filename);
    };
    
    const noSoldCars = soldCarsWithProfit.length === 0;

    const monthDisplay = useMemo(() => {
        const monthName = currentMonth.toLocaleString('es-ES', { month: 'long' });
        const year = currentMonth.getFullYear();
        return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
    }, [currentMonth]);

    return (
        <div>
            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Resumen de Ventas</h1>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center justify-between p-2 bg-component-bg rounded-xl border border-border-color shadow-lg w-full sm:w-auto">
                        <button onClick={() => changeMonth(-1)} className="p-2 w-10 h-10 flex items-center justify-center hover:bg-component-bg-hover rounded-lg transition-colors" title="Mes anterior" disabled={viewMode === 'all'}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <div className="text-center font-semibold text-text-primary whitespace-nowrap px-2">
                            {viewMode === 'monthly' ? monthDisplay : 'Todas las ventas'}
                        </div>
                        <button 
                            onClick={() => changeMonth(1)}
                            disabled={isNextMonthDisabled || viewMode === 'all'}
                            className="p-2 w-10 h-10 flex items-center justify-center hover:bg-component-bg-hover rounded-lg transition-colors disabled:opacity-50"
                            title="Siguiente mes"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                    
                    <div className="flex items-stretch gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode(prev => prev === 'monthly' ? 'all' : 'monthly')}
                            className="flex-grow sm:flex-grow-0 bg-component-bg backdrop-blur-lg text-text-primary px-4 h-12 flex items-center justify-center rounded-xl hover:bg-component-bg-hover transition-colors border border-border-color shadow-2xl text-sm font-semibold"
                            title={viewMode === 'monthly' ? "Ver todas las ventas" : "Ver ventas por mes"}
                        >
                            {viewMode === 'monthly' ? 'Ver Todas' : 'Ver por Mes'}
                        </button>
                        <button 
                            onClick={generatePDF} 
                            disabled={noSoldCars}
                            className="flex-shrink-0 w-12 h-12 bg-component-bg backdrop-blur-lg text-text-primary flex items-center justify-center rounded-xl hover:bg-component-bg-hover transition-colors border border-border-color disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
                            title={noSoldCars ? "No hay ventas para exportar" : "Generar PDF"}
                        >
                            <FontAwesomeIcon icon={faDownload} className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            {/* --- FIN DE LA MODIFICACIÓN --- */}

            {paginatedCars.length > 0 ? (
                <>
                    <div className="space-y-4 md:hidden">
                        {paginatedCars.map(car => (
                            <div 
                                key={car.id} 
                                className="bg-component-bg backdrop-blur-lg rounded-2xl border border-border-color p-4 cursor-pointer hover:bg-component-bg-hover/50 transition-colors shadow-2xl"
                                onClick={() => onViewDetailsClick(car)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-16 h-12 rounded-lg flex-shrink-0 border border-border-color overflow-hidden">
                                            {car.imageUrl ? (
                                                <img 
                                                    src={car.imageUrl} 
                                                    className="w-full h-full object-cover" 
                                                    alt={`${car.make} ${car.model}`} 
                                                />
                                            ) : (
                                                <CarPlaceholderImage car={car} size="small" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-text-primary truncate">{car.make} {car.model}</p>
                                            <p className="text-sm text-text-secondary flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faCalendarDay} className="w-3 h-3" />
                                                {new Date(car.registrationDate).getFullYear()}
                                            </p>
                                            <p className="text-sm text-text-secondary">{car.licensePlate}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        {canViewSensitiveData ? (
                                            <>
                                                <p className={`font-bold text-lg ${car.profit >= 0 ? 'text-green-accent' : 'text-red-accent'}`}>
                                                    {car.profit >= 0 ? '+' : ''}{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.profit)}
                                                </p>
                                                <p className="text-xs text-text-secondary">Beneficio</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-bold text-lg text-green-accent">
                                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}
                                                </p>
                                                <p className="text-xs text-text-secondary">Venta</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className={`grid ${canViewSensitiveData ? 'grid-cols-3' : 'grid-cols-2'} items-center pt-3 border-t border-border-color text-xs`}>
                                    {canViewSensitiveData && (
                                        <div className="text-left">
                                            <p className="text-text-secondary">Compra:</p>
                                            <p className="text-text-primary font-medium">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}</p>
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <p className="text-text-secondary">Gastos:</p>
                                        <p className="text-text-primary font-medium">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.totalExpenses)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-text-secondary">Venta:</p>
                                        <p className="text-text-primary font-medium">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:block bg-component-bg backdrop-blur-lg rounded-2xl border border-border-color overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs uppercase bg-component-bg-hover/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Coche</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Matrícula</th>
                                        {canViewSensitiveData && (
                                            <th scope="col" className="px-6 py-4 whitespace-nowrap">Precio Compra</th>
                                        )}
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Gastos</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Precio Venta</th>
                                        {canViewSensitiveData && (
                                            <th scope="col" className="px-6 py-4 whitespace-nowrap">Beneficio/Pérdida</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {paginatedCars.map(car => (
                                        <tr 
                                            key={car.id} 
                                            className="cursor-pointer hover:bg-component-bg-hover/50 transition-colors"
                                            onClick={() => onViewDetailsClick(car)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-10 rounded-lg border border-border-color overflow-hidden flex-shrink-0">
                                                        {car.imageUrl ? (
                                                            <img 
                                                                src={car.imageUrl} 
                                                                className="w-full h-full object-cover" 
                                                                alt={`${car.make} ${car.model}`} 
                                                            />
                                                        ) : (
                                                            <CarPlaceholderImage car={car} size="small" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-text-primary">{car.make} {car.model}</p>
                                                        <p className="text-xs text-text-secondary">{new Date(car.registrationDate).getFullYear()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="bg-background/50 text-text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-border-color">
                                                    {car.licensePlate}
                                                </span>
                                            </td>
                                            {canViewSensitiveData && (
                                                <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.totalExpenses)}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}
                                            </td>
                                            {canViewSensitiveData && (
                                                <td className={`px-6 py-4 font-bold whitespace-nowrap ${car.profit >= 0 ? 'text-green-accent' : 'text-red-accent'}`}>
                                                    {car.profit >= 0 ? '+' : ''}{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.profit)}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-component-bg-hover text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border-color transition-colors flex items-center gap-2 font-semibold border border-border-color"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} /> Anterior
                            </button>
                            <span className="text-text-secondary font-medium text-sm">Página {currentPage} de {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-component-bg-hover text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border-color transition-colors flex items-center gap-2 font-semibold border border-border-color"
                            >
                                Siguiente <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16 px-4 bg-component-bg backdrop-blur-lg rounded-2xl border border-border-color shadow-2xl">
                    <FontAwesomeIcon icon={faTags} className="text-5xl text-text-secondary/50 mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary">
                        {viewMode === 'monthly' ? "No hay ventas registradas para este mes" : "Aún no hay ventas registradas"}
                    </h3>
                    <p className="text-text-secondary mt-2">Cuando vendas un coche, aparecerá aquí el resumen.</p>
                    <Link to="/cars" className="mt-6 inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-colors">
                        <FontAwesomeIcon icon={faCar} />
                        Ver mis coches
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SalesSummary;