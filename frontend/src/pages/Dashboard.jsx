// autogest-app/frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faCalendarPlus, faReceipt, faTags, faChevronLeft, faChevronRight, faWrench, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import { ThemeContext } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// --- Tarjeta de Estadística con variantes (Clara y Oscura) ---
const StatCard = ({ title, value, colorClass, onClick, isClickable, variant = 'light' }) => {
    const isDark = variant === 'dark';

    // Si es dark usamos un degradado azul marino elegante, si no, blanco normal.
    const baseClasses = isDark
        ? 'bg-gradient-to-br from-[#020B1C] to-[#06122A] p-5 rounded-[14px] border border-transparent shadow-md flex flex-col justify-center h-full'
        : 'bg-white p-5 rounded-[14px] border border-gray-200 shadow-sm flex flex-col justify-center h-full';

    const hoverClasses = isClickable
        ? (isDark ? 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5' : 'cursor-pointer transition-all duration-200 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5')
        : '';

    const titleClasses = isDark ? 'text-gray-400' : 'text-gray-500';

    // Ajuste de contraste: Si la tarjeta es oscura, aclaramos los colores verde/rojo para que peguen bien
    let finalColorClass = isDark ? 'text-white' : 'text-[#020B1C]';
    if (colorClass) {
        if (isDark) {
            if (colorClass.includes('green')) finalColorClass = 'text-green-400';
            else if (colorClass.includes('red')) finalColorClass = 'text-red-400';
            else finalColorClass = 'text-white';
        } else {
            finalColorClass = colorClass;
        }
    }

    return (
        <div className={`${baseClasses} ${hoverClasses}`} onClick={onClick}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${titleClasses}`}>{title}</h3>
            <p className={`text-2xl font-extrabold whitespace-nowrap ${finalColorClass}`}>
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)}
            </p>
        </div>
    );
};

const ActivityHistory = () => {
    const navigate = useNavigate();
    const [activityData, setActivityData] = useState({ activities: [], currentPage: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('');
    const filterContainerRef = useRef(null);

    const filters = [
        { key: '', label: 'Todos' },
        { key: 'creacion', label: 'Añadidos' },
        { key: 'venta', label: 'Ventas' },
        { key: 'reserva', label: 'Reservas' },
        { key: 'gasto', label: 'Gastos' },
    ];

    const fetchActivity = useCallback(async (page, filter) => {
        setIsLoading(true);
        try {
            const data = await api.dashboard.getActivity(page, filter);
            setActivityData(data);
        } catch (error) {
            console.error("Error al cargar el historial:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFilterClick = (filterKey) => {
        setActiveFilter(filterKey);
        fetchActivity(1, filterKey);
    };

    useEffect(() => {
        fetchActivity(1, '');
    }, [fetchActivity]);

    useEffect(() => {
        const el = filterContainerRef.current;
        if (el) {
            const onWheel = (e) => {
                if (e.deltaY === 0) return;
                e.preventDefault();
                el.scrollTo({
                    left: el.scrollLeft + e.deltaY,
                    behavior: 'smooth'
                });
            };
            el.addEventListener('wheel', onWheel);
            return () => el.removeEventListener('wheel', onWheel);
        }
    }, []);

    const handleCarClick = (carId) => {
        if (carId) {
            navigate('/cars', { state: { carIdToOpen: carId } });
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'creacion': return { icon: faCalendarPlus, color: 'text-[#020B1C]' };
            case 'venta': return { icon: faReceipt, color: 'text-[#10b981]' }; // Verde Esmeralda
            case 'reserva': return { icon: faTags, color: 'text-[#f59e0b]' }; // Naranja/Ambar
            case 'gasto': return { icon: faWrench, color: 'text-[#ED123A]' };
            default: return { icon: faCar, color: 'text-gray-400' };
        }
    };

    return (
        <div className="bg-white p-6 rounded-[14px] border border-gray-200 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-[#020B1C] mb-4 text-sm uppercase tracking-wide">Historial de Actividad</h3>

            <div ref={filterContainerRef} className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar flex-shrink-0 min-w-0 pb-2">
                {filters.map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => handleFilterClick(filter.key)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors whitespace-nowrap border ${activeFilter === filter.key
                            ? 'bg-[#020B1C] text-white border-[#020B1C]'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex-grow flex items-center justify-center text-gray-400">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                </div>
            ) : activityData.activities.length > 0 ? (
                <>
                    <div className="space-y-2 flex-grow overflow-y-auto no-scrollbar min-h-[200px]">
                        {activityData.activities.map((item, index) => {
                            const { icon, color } = getActivityIcon(item.type);
                            const isClickable = !!item.carId;
                            return (
                                <div
                                    key={index}
                                    onClick={() => isClickable && handleCarClick(item.carId)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border border-gray-100 ${isClickable ? 'cursor-pointer hover:bg-gray-50 hover:border-gray-200' : 'cursor-default'} transition-all`}
                                >
                                    <div className={`flex-shrink-0 ${color}`}>
                                        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{item.description}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 flex-shrink-0">
                        <button
                            onClick={() => fetchActivity(activityData.currentPage - 1, activeFilter)}
                            disabled={activityData.currentPage <= 1}
                            className="p-2 text-gray-500 hover:text-[#020B1C] disabled:opacity-30 transition-colors"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <span className="text-xs font-bold text-gray-400">PÁGINA {activityData.currentPage} DE {activityData.totalPages}</span>
                        <button
                            onClick={() => fetchActivity(activityData.currentPage + 1, activeFilter)}
                            disabled={activityData.currentPage >= activityData.totalPages}
                            className="p-2 text-gray-500 hover:text-[#020B1C] disabled:opacity-30 transition-colors"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-grow flex items-center justify-center text-gray-400 text-sm italic">Sin actividad reciente.</div>
            )}
        </div>
    );
};

const Dashboard = ({ cars, expenses, onTotalInvestmentClick, onRevenueClick }) => {
    const { activeTheme } = useContext(ThemeContext);
    const [generalStats, setGeneralStats] = useState({ totalInvestment: 0, totalRevenue: 0, potentialRevenue: 0, totalExpenses: 0, totalProfit: 0 });
    const [monthlyStats, setMonthlyStats] = useState({ totalInvestment: 0, totalRevenue: 0, potentialRevenue: 0, totalExpenses: 0, totalProfit: 0 });
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        const fetchGeneralStats = async () => {
            try {
                const data = await api.dashboard.getStats();
                setGeneralStats(data);
            } catch (error) {
                console.error("Error al cargar estadísticas generales:", error);
            }
        };
        fetchGeneralStats();
    }, []);

    useEffect(() => {
        const fetchMonthlyStats = async () => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

            try {
                const data = await api.dashboard.getStats(startDate, endDate);
                setMonthlyStats(data);
            } catch (error) {
                console.error("Error al cargar estadísticas mensuales:", error);
            }
        };
        fetchMonthlyStats();
    }, [currentMonth]);

    useEffect(() => {
        ChartJS.defaults.color = '#6B7280';
        ChartJS.defaults.borderColor = '#E5E7EB';
        ChartJS.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
    }, []);

    const changeMonth = (amount) => {
        setCurrentMonth(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const isNextMonthDisabled = () => {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth > new Date();
    };

    const expensesByCategoryData = useMemo(() => {
        const categories = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount || 0);
            return acc;
        }, {});

        return {
            labels: Object.keys(categories),
            datasets: [{
                label: 'GASTOS',
                data: Object.values(categories),
                backgroundColor: 'rgba(237, 18, 58, 0.8)',
                borderColor: '#ED123A',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: '#C90E30',
            }],
        };
    }, [expenses]);

    const statusData = useMemo(() => {
        const statusCounts = cars.reduce((acc, car) => {
            acc[car.status] = (acc[car.status] || 0) + 1;
            return acc;
        }, {});

        // COLORES CORREGIDOS: Colores vibrantes y armoniosos
        const colors = {
            'En venta': '#3b82f6', // Azul brillante
            'Reservado': '#f59e0b', // Ambar
            'Vendido': '#10b981', // Verde esmeralda
            'Taller': '#6B7280', // Gris
        };

        const labels = Object.keys(statusCounts);
        return {
            labels: labels,
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: labels.map(label => colors[label] || colors['Taller']),
                borderWidth: 0,
            }],
        };
    }, [cars]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#020B1C',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { borderDash: [4, 4], color: '#f3f4f6' }, beginAtZero: true }
        }
    };

    const pieOptions = {
        ...chartOptions,
        scales: { x: { display: false }, y: { display: false } },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: { size: 11, weight: 'bold' }
                }
            },
            tooltip: chartOptions.plugins.tooltip
        }
    };

    return (
        <div className="space-y-8 sm:pb-16 lg:pb-0">
            {/* --- RESUMEN GENERAL --- */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-extrabold text-[#020B1C] tracking-tight">Visión General</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
                    <StatCard
                        title="Inversión Total"
                        value={generalStats.totalInvestment}
                        onClick={onTotalInvestmentClick}
                        isClickable={true}
                        variant="dark"
                    />
                    <StatCard
                        title="Ingresos Reales"
                        value={generalStats.totalRevenue}
                        colorClass="text-[#10b981]"
                        onClick={onRevenueClick}
                        isClickable={true}
                    />
                    <StatCard
                        title="Ingresos Potenciales"
                        value={generalStats.potentialRevenue}
                        colorClass="text-[#020B1C]"
                    />
                    <StatCard
                        title="Gastos Totales"
                        value={generalStats.totalExpenses}
                        colorClass="text-[#ED123A]"
                    />
                    <StatCard
                        title="Beneficio Neto"
                        value={generalStats.totalProfit}
                        variant="dark"
                        colorClass={generalStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}
                    />
                </div>
            </div>

            {/* --- RESUMEN MENSUAL --- */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <h2 className="text-xl font-extrabold text-[#020B1C] tracking-tight">Rendimiento Mensual</h2>

                    <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm p-1">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#020B1C] rounded-md transition-colors"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <span className="px-4 text-sm font-bold text-[#020B1C] uppercase min-w-[140px] text-center">
                            {currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => changeMonth(1)}
                            disabled={isNextMonthDisabled()}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#020B1C] rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard title="Inversión Mes" value={monthlyStats.totalInvestment} variant="dark" />
                    <StatCard title="Ingresos Mes" value={monthlyStats.totalRevenue} colorClass="text-[#10b981]" />
                    <StatCard title="Gastos Mes" value={monthlyStats.totalExpenses} colorClass="text-[#ED123A]" />
                    <StatCard title="Beneficio Mes" value={monthlyStats.totalProfit} variant="dark" colorClass={monthlyStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'} />
                </div>
            </div>

            {/* --- GRÁFICAS Y ACTIVIDAD --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-[14px] border border-gray-200 shadow-sm h-80 flex flex-col">
                        <h3 className="font-bold text-[#020B1C] mb-4 text-sm uppercase tracking-wide">Gastos por Categoría</h3>
                        <div className="relative flex-grow">
                            <Bar data={expensesByCategoryData} options={chartOptions} />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-[14px] border border-gray-200 shadow-sm h-80 flex flex-col">
                        <h3 className="font-bold text-[#020B1C] mb-4 text-sm uppercase tracking-wide">Estado del Inventario</h3>
                        <div className="relative flex-grow">
                            <Pie data={statusData} options={pieOptions} />
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-1 h-[calc(40rem+1.5rem)] xl:h-auto">
                    <ActivityHistory />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;