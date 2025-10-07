// autogest-app/frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faCalendarPlus, faReceipt, faTags, faChevronLeft, faChevronRight, faWrench, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import { ThemeContext } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatCard = ({ title, value, colorClass, onClick, isClickable }) => (
    <div 
        className={`bg-component-bg backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-border-color ${isClickable ? 'cursor-pointer transition-all duration-300 hover:border-accent hover:scale-[1.03] hover:shadow-xl' : ''}`}
        onClick={onClick}
    >
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)}</p>
    </div>
);

const ActivityHistory = () => {
    const navigate = useNavigate();
    const [activityData, setActivityData] = useState({ activities: [], currentPage: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchActivity = async (page) => {
        setIsLoading(true);
        try {
            const data = await api.dashboard.getActivity(page);
            setActivityData(data);
        } catch (error) {
            console.error("Error al cargar el historial:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity(1);
    }, []);

    const handleCarClick = (carId) => {
        if (carId) {
            navigate('/cars', { state: { carIdToOpen: carId } });
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'creacion': return { icon: faCalendarPlus, color: 'text-blue-accent' };
            case 'venta': return { icon: faReceipt, color: 'text-green-accent' };
            case 'reserva': return { icon: faTags, color: 'text-yellow-accent' };
            case 'gasto': return { icon: faWrench, color: 'text-red-accent' };
            default: return { icon: faCar, color: 'text-text-secondary' };
        }
    };

    return (
        <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-border-color h-full flex flex-col">
            <h3 className="font-semibold text-text-primary mb-4 flex-shrink-0">HISTORIAL DE ACTIVIDAD</h3>
            {isLoading ? (
                <div className="flex-grow flex items-center justify-center text-text-secondary">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                </div>
            ) : activityData.activities.length > 0 ? (
                <>
                    <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                        {activityData.activities.map((item, index) => {
                            const { icon, color } = getActivityIcon(item.type);
                            const isClickable = !!item.carId;
                            return (
                                <div 
                                    key={index} 
                                    onClick={() => isClickable && handleCarClick(item.carId)} 
                                    className={`flex items-center gap-4 p-3 rounded-xl ${isClickable ? 'cursor-pointer hover:bg-component-bg-hover' : 'cursor-default'} transition-colors`}
                                >
                                    <FontAwesomeIcon icon={icon} className={`w-5 h-5 ${color}`} />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">{item.description}</p>
                                        <p className="text-xs text-text-secondary">{new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-color flex-shrink-0">
                        <button onClick={() => fetchActivity(activityData.currentPage - 1)} disabled={activityData.currentPage <= 1} className="px-3 py-1.5 rounded-lg bg-component-bg-hover disabled:opacity-50 hover:bg-border-color transition-colors">
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <span className="text-sm font-semibold text-text-secondary">PÁGINA {activityData.currentPage} DE {activityData.totalPages}</span>
                        <button onClick={() => fetchActivity(activityData.currentPage + 1)} disabled={activityData.currentPage >= activityData.totalPages} className="px-3 py-1.5 rounded-lg bg-component-bg-hover disabled:opacity-50 hover:bg-border-color transition-colors">
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-grow flex items-center justify-center text-text-secondary text-sm">NO HAY ACTIVIDAD RECIENTE.</div>
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
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim();
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim();
        ChartJS.defaults.color = textColor;
        ChartJS.defaults.borderColor = gridColor;
    }, [activeTheme]);

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
                backgroundColor: `rgba(${activeTheme.accentRgb}, 0.5)`,
                borderColor: activeTheme.accent, 
                borderWidth: 1,
                borderRadius: 8,
            }],
        };
    }, [expenses, activeTheme]);
    
    const statusData = useMemo(() => {
        const statusCounts = cars.reduce((acc, car) => {
            acc[car.status] = (acc[car.status] || 0) + 1;
            return acc;
        }, {});
        
        const colors = {
            'En venta': '#60a5fa',
            'Reservado': '#facc15',
            'Vendido': '#4ade80',
            'Taller': '#908CAA',
            'Otro': '#908CAA'
        };
        const borderColor = 'rgb(53, 33, 90)';

        const labels = Object.keys(statusCounts);
        return {
            labels: labels,
            datasets: [{ 
                data: Object.values(statusCounts), 
                backgroundColor: labels.map(label => colors[label] || colors['Otro']), 
                borderColor: borderColor,
                borderWidth: 4,
            }],
        };
    }, [cars]);

    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    const pieOptions = { ...chartOptions, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } } };

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-4">DASHBOARD GENERAL</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <StatCard title="INVERSIÓN TOTAL" value={generalStats.totalInvestment} colorClass="text-text-primary" onClick={onTotalInvestmentClick} isClickable={true} />
                    <StatCard title="INGRESOS REALES" value={generalStats.totalRevenue} colorClass="text-green-accent" onClick={onRevenueClick} isClickable={true} />
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <StatCard title="INGRESOS POTENCIALES" value={generalStats.potentialRevenue} colorClass="text-accent" />
                    <StatCard title="GASTOS" value={generalStats.totalExpenses} colorClass="text-red-accent" />
                    <StatCard title="BENEFICIO NETO" value={generalStats.totalProfit} colorClass={generalStats.totalProfit >= 0 ? 'text-green-accent' : 'text-accent'} />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-4">DASHBOARD POR MES</h2>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-72 xl:w-80 flex-shrink-0">
                        <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-border-color">
                            <h3 className="text-lg font-semibold text-text-primary mb-4">SELECCIONAR MES</h3>
                            <div className="flex items-center justify-between p-2 bg-background rounded-xl border border-border-color">
                                <button onClick={() => changeMonth(-1)} className="p-2 w-10 h-10 flex items-center justify-center hover:bg-component-bg-hover rounded-lg transition-colors" title="MES ANTERIOR">
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <div className="text-center font-semibold text-text-primary">
                                    {currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                                </div>
                                <button 
                                    onClick={() => changeMonth(1)} 
                                    disabled={isNextMonthDisabled()}
                                    className="p-2 w-10 h-10 flex items-center justify-center hover:bg-component-bg-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="SIGUIENTE MES"
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatCard title="INVERSIÓN DEL MES" value={monthlyStats.totalInvestment} colorClass="text-text-primary" />
                        <StatCard title="INGRESOS DEL MES" value={monthlyStats.totalRevenue} colorClass="text-green-accent" />
                        <StatCard title="GASTOS DEL MES" value={monthlyStats.totalExpenses} colorClass="text-red-accent" />
                        <StatCard title="BENEFICIO DEL MES" value={monthlyStats.totalProfit} colorClass={monthlyStats.totalProfit >= 0 ? 'text-green-accent' : 'text-accent'} />
                    </div>
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-border-color h-96 flex flex-col">
                        <h3 className="font-semibold text-text-primary mb-4 flex-shrink-0">GASTOS GENERALES POR CATEGORÍA</h3>
                        <div className="relative flex-grow">
                            <Bar data={expensesByCategoryData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-border-color h-96 flex flex-col">
                        <h3 className="font-semibold text-text-primary mb-4 flex-shrink-0">DISTRIBUCIÓN GENERAL DE COCHES</h3>
                        <div className="relative flex-grow">
                            <Pie data={statusData} options={pieOptions} />
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-1 h-[32rem] xl:h-[calc(2*24rem+2rem)]">
                     <ActivityHistory />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;