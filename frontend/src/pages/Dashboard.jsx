// autogest-app/frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faCalendarPlus, faReceipt, faTags, faChevronLeft, faChevronRight, faFilter, faTimes, faWrench } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatCard = ({ title, value, colorClass, onClick, isClickable }) => (
    <div 
        className={`bg-component-bg p-6 rounded-lg shadow-sm border border-border-color ${isClickable ? 'cursor-pointer transition-colors hover:bg-component-bg-hover' : ''}`}
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
        <div className="bg-component-bg p-6 rounded-lg shadow-sm border border-border-color h-full flex flex-col">
            <h3 className="font-semibold text-text-primary mb-4 flex-shrink-0">Historial de Actividad</h3>
            {isLoading ? (
                <div className="flex-grow flex items-center justify-center text-text-secondary">Cargando...</div>
            ) : activityData.activities.length > 0 ? (
                <>
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <div className="space-y-4 flex-grow overflow-y-auto">
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                        {activityData.activities.map((item, index) => {
                            const { icon, color } = getActivityIcon(item.type);
                            const isClickable = !!item.carId;
                            return (
                                <div 
                                    key={index} 
                                    onClick={() => isClickable && handleCarClick(item.carId)} 
                                    className={`flex items-center gap-4 p-2 rounded-md ${isClickable ? 'cursor-pointer hover:bg-component-bg-hover' : 'cursor-default'}`}
                                >
                                    <FontAwesomeIcon icon={icon} className={`w-5 h-5 ${color}`} />
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-text-primary">{item.description}</p>
                                        <p className="text-xs text-text-secondary">{new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-color flex-shrink-0">
                        <button onClick={() => fetchActivity(activityData.currentPage - 1)} disabled={activityData.currentPage <= 1} className="px-3 py-1 rounded-md bg-component-bg-hover disabled:opacity-50">
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <span className="text-sm text-text-secondary">Página {activityData.currentPage} de {activityData.totalPages}</span>
                        <button onClick={() => fetchActivity(activityData.currentPage + 1)} disabled={activityData.currentPage >= activityData.totalPages} className="px-3 py-1 rounded-md bg-component-bg-hover disabled:opacity-50">
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-grow flex items-center justify-center text-text-secondary">No hay actividad reciente.</div>
            )}
        </div>
    );
};

const Dashboard = ({ cars, expenses, isDarkMode, onTotalInvestmentClick, onRevenueClick }) => {
    const [stats, setStats] = useState({ totalInvestment: 0, totalRevenue: 0, totalExpenses: 0, totalProfit: 0 });
    const [dates, setDates] = useState({ startDate: '', endDate: '' });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.dashboard.getStats(dates.startDate, dates.endDate);
                setStats(data);
            } catch (error) {
                console.error("Error al cargar estadísticas:", error);
            }
        };
        fetchStats();
    }, [dates]);
    
    useEffect(() => {
        const textColor = isDarkMode ? '#94a3b8' : '#64748b';
        const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
        ChartJS.defaults.color = textColor;
        ChartJS.defaults.borderColor = gridColor;
    }, [isDarkMode]);

    const handleDateChange = (e) => {
        setDates(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearDates = () => {
        setDates({ startDate: '', endDate: '' });
    };

    const expensesByCategoryData = useMemo(() => {
        const categories = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount || 0);
            return acc;
        }, {});
        return {
            labels: Object.keys(categories),
            datasets: [{ 
                label: 'Gastos', 
                data: Object.values(categories), 
                backgroundColor: isDarkMode ? 'rgba(197, 164, 126, 0.5)' : 'rgba(184, 134, 11, 0.6)', 
                borderColor: isDarkMode ? '#C5A47E' : '#B8860B', 
                borderWidth: 1,
                borderRadius: 4,
            }],
        };
    }, [expenses, isDarkMode]);
    
    const statusData = useMemo(() => {
        const statusCounts = cars.reduce((acc, car) => {
            acc[car.status] = (acc[car.status] || 0) + 1;
            return acc;
        }, {});
        
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
        const colors = {
            'En venta': accentColor,
            'Reservado': isDarkMode ? '#FFA500' : '#FF8C00',
            'Vendido': isDarkMode ? '#00FF00' : '#32CD32',
            'Otro': isDarkMode ? '#94a3b8' : '#64748b'
        };

        const labels = Object.keys(statusCounts);
        return {
            labels: labels,
            datasets: [{ 
                data: Object.values(statusCounts), 
                backgroundColor: labels.map(label => colors[label] || colors['Otro']), 
                borderColor: 'var(--color-component-bg)'
            }],
        };
    }, [cars, isDarkMode]);

    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    const pieOptions = { ...chartOptions, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } } };

    return (
        <div className="space-y-6">
            <div className="relative bg-component-bg p-4 rounded-lg shadow-sm border border-border-color">
                <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors z-10 p-2 rounded-full hover:bg-component-bg-hover"
                    title={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                >
                    <FontAwesomeIcon icon={showFilters ? faTimes : faFilter} className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-semibold text-text-primary mb-4 pr-12">Filtros de Datos</h3>
                
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-border-color animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <div>
                                    <label htmlFor="startDate" className="text-xs text-text-secondary">Desde</label>
                                    <input type="date" name="startDate" id="startDate" value={dates.startDate} onChange={handleDateChange} className="w-full text-sm p-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent"/>
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="text-xs text-text-secondary">Hasta</label>
                                    <input type="date" name="endDate" id="endDate" value={dates.endDate} onChange={handleDateChange} className="w-full text-sm p-2 bg-background border border-border-color rounded-md focus:ring-1 focus:ring-accent"/>
                                </div>
                            </div>
                            <button onClick={clearDates} className="w-full sm:w-auto text-sm text-accent hover:opacity-80 transition-opacity px-4 py-2">Limpiar</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Inversión Total" value={stats.totalInvestment} colorClass="text-text-primary" onClick={onTotalInvestmentClick} isClickable={true} />
                <StatCard title="Ingresos" value={stats.totalRevenue} colorClass="text-green-accent" onClick={onRevenueClick} isClickable={true} />
                <StatCard title="Gastos" value={stats.totalExpenses} colorClass="text-red-accent" />
                <StatCard title="Beneficio Neto" value={stats.totalProfit} colorClass={stats.totalProfit >= 0 ? 'text-accent' : 'text-red-accent'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-component-bg p-6 rounded-lg shadow-sm border border-border-color h-96 flex flex-col">
                    <h3 className="font-semibold text-text-primary mb-4 flex-shrink-0">Gastos por Categoría (Total)</h3>
                    <div className="relative flex-grow">
                        <Bar data={expensesByCategoryData} options={chartOptions} />
                    </div>
                </div>
                <div className="lg:col-span-2 bg-component-bg p-6 rounded-lg shadow-sm border border-border-color h-96 flex flex-col">
                    <h3 className="font-semibold text-text-primary mb-4 flex-shrink-0">Coches por Estado (Total)</h3>
                    <div className="relative flex-grow">
                        <Pie data={statusData} options={pieOptions} />
                    </div>
                </div>
            </div>
            
            <div className="h-96">
                 <ActivityHistory />
            </div>
        </div>
    );
};

export default Dashboard;