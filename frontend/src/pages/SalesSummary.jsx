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
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Resumen de Ventas</h1>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Navegador de Meses */}
                    <div className="flex items-center justify-between p-1 bg-white rounded-lg border border-gray-300 shadow-sm w-full sm:w-auto">
                        <button 
                            onClick={() => changeMonth(-1)} 
                            className="p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-500 rounded-md transition-colors" 
                            title="Mes anterior" 
                            disabled={viewMode === 'all'}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <div className={`text-center font-bold text-sm text-gray-800 whitespace-nowrap px-4 uppercase ${viewMode === 'all' ? 'opacity-40' : ''}`}>
                            {viewMode === 'monthly' ? monthDisplay : 'HISTÓRICO COMPLETO'}
                        </div>
                        <button 
                            onClick={() => changeMonth(1)}
                            disabled={isNextMonthDisabled || viewMode === 'all'}
                            className="p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-500 rounded-md transition-colors disabled:opacity-30"
                            title="Siguiente mes"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                    
                    {/* Botones de Acción */}
                    <div className="flex items-stretch gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode(prev => prev === 'monthly' ? 'all' : 'monthly')}
                            className="flex-grow sm:flex-grow-0 bg-white text-gray-700 px-4 h-12 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm text-sm font-bold uppercase"
                            title={viewMode === 'monthly' ? "Ver todas las ventas" : "Ver ventas por mes"}
                        >
                            {viewMode === 'monthly' ? 'Ver Todas' : 'Ver Mes'}
                        </button>
                        <button 
                            onClick={generatePDF} 
                            disabled={noSoldCars}
                            className="flex-shrink-0 w-12 h-12 bg-white text-gray-700 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            title={noSoldCars ? "No hay ventas para exportar" : "Generar PDF"}
                        >
                            <FontAwesomeIcon icon={faDownload} />
                        </button>
                    </div>
                </div>
            </div>

            {paginatedCars.length > 0 ? (
                <>
                    {/* VISTA MÓVIL: Tarjetas estilo Occident */}
                    <div className="space-y-4 md:hidden">
                        {paginatedCars.map(car => (
                            <div 
                                key={car.id} 
                                className="bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer relative overflow-hidden transition-transform active:scale-[0.99]"
                                onClick={() => onViewDetailsClick(car)}
                            >
                                {/* Franja lateral roja */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent z-10"></div>

                                <div className="p-4 pl-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-14 h-14 rounded bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
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
                                                <p className="font-bold text-gray-900 truncate uppercase text-sm">{car.make} {car.model}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <FontAwesomeIcon icon={faCalendarDay} className="w-3 h-3" />
                                                    {new Date(car.registrationDate).getFullYear()} • {car.licensePlate}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            {canViewSensitiveData ? (
                                                <>
                                                    <p className={`font-extrabold text-base ${car.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {car.profit >= 0 ? '+' : ''}{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.profit)}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Beneficio</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-extrabold text-base text-green-600">
                                                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.salePrice)}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Venta</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className={`grid ${canViewSensitiveData ? 'grid-cols-3' : 'grid-cols-2'} items-center pt-3 border-t border-gray-100 text-xs`}>
                                        {canViewSensitiveData && (
                                            <div className="text-left">
                                                <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Compra</p>
                                                <p className="text-gray-800 font-bold mt-0.5">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.purchasePrice)}</p>
                                            </div>
                                        )}
                                        <div className={`${canViewSensitiveData ? 'text-center' : 'text-left'}`}>
                                            <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Gastos</p>
                                            <p className="text-gray-800 font-bold mt-0.5">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.totalExpenses)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Venta</p>
                                            <p className="text-gray-800 font-bold mt-0.5">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.salePrice)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* VISTA ESCRITORIO: Tabla Limpia */}
                    <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs uppercase bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Vehículo</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Matrícula</th>
                                        {canViewSensitiveData && (
                                            <th scope="col" className="px-6 py-4 whitespace-nowrap text-right">Compra</th>
                                        )}
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap text-right">Gastos</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap text-right">Venta</th>
                                        {canViewSensitiveData && (
                                            <th scope="col" className="px-6 py-4 whitespace-nowrap text-right">Beneficio</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedCars.map(car => (
                                        <tr 
                                            key={car.id} 
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => onViewDetailsClick(car)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                        {car.imageUrl ? (
                                                            <img 
                                                                src={car.imageUrl} 
                                                                className="w-full h-full object-cover" 
                                                                alt="" 
                                                            />
                                                        ) : (
                                                            <CarPlaceholderImage car={car} size="small" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 uppercase text-xs">{car.make} {car.model}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{new Date(car.registrationDate).getFullYear()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded border border-gray-200">
                                                    {car.licensePlate}
                                                </span>
                                            </td>
                                            {canViewSensitiveData && (
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-right">
                                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-right">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.totalExpenses)}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-right">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}
                                            </td>
                                            {canViewSensitiveData && (
                                                <td className={`px-6 py-4 font-bold whitespace-nowrap text-right ${car.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {car.profit >= 0 ? '+' : ''}{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.profit)}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-bold"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} /> Anterior
                            </button>
                            <span className="text-gray-500 font-medium text-sm">Página {currentPage} de {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-bold"
                            >
                                Siguiente <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 px-4 bg-white rounded-lg border border-gray-200 border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        <FontAwesomeIcon icon={faTags} className="text-3xl text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {viewMode === 'monthly' ? "No hay ventas este mes" : "Aún no hay ventas registradas"}
                    </h3>
                    <p className="text-gray-500 mt-2 mb-6">Cuando vendas un coche, el resumen financiero aparecerá aquí.</p>
                    <Link to="/cars" className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg shadow hover:bg-accent-hover transition-colors font-bold text-sm uppercase">
                        <FontAwesomeIcon icon={faCar} />
                        Ir al Inventario
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SalesSummary;