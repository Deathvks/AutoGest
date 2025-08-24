import React, { useMemo, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// --- Configuración de Chart.js ---
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatCard = ({ title, value, colorClass }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)}</p>
    </div>
);

const Dashboard = ({ cars, expenses, isDarkMode }) => {
    useEffect(() => {
        ChartJS.defaults.color = isDarkMode ? '#9ca3af' : '#6b7280';
        ChartJS.defaults.borderColor = isDarkMode ? '#374151' : '#e5e7eb';
    }, [isDarkMode]);

    const summary = useMemo(() => {
        const totalRevenue = cars
            .filter(c => c.status === 'Vendido')
            .reduce((sum, car) => sum + (car.salePrice || 0), 0);
        
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        const totalProfit = cars
            .filter(c => c.status === 'Vendido')
            .reduce((sum, car) => sum + ((car.salePrice || 0) - car.purchasePrice), 0) - totalExpenses;

        return {
            totalInvestment: cars.reduce((sum, car) => sum + car.purchasePrice, 0),
            totalRevenue,
            totalExpenses,
            totalProfit,
        };
    }, [cars, expenses]);

    const expensesByCategoryData = useMemo(() => {
        const categories = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});
        return {
            labels: Object.keys(categories),
            datasets: [{ 
                label: 'Gastos', 
                data: Object.values(categories), 
                backgroundColor: 'rgba(59, 130, 246, 0.5)', 
                borderColor: 'rgba(59, 130, 246, 1)', 
                borderWidth: 1 
            }],
        };
    }, [expenses]);
    
    const statusData = useMemo(() => {
        const statuses = cars.reduce((acc, car) => {
            acc[car.status] = (acc[car.status] || 0) + 1;
            return acc;
        }, {});
        return {
            labels: Object.keys(statuses),
            datasets: [{ 
                data: Object.values(statuses), 
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'], 
                borderColor: isDarkMode ? '#1f2937' : '#ffffff' 
            }],
        };
    }, [cars, isDarkMode]);

    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    const pieOptions = { ...chartOptions, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } } };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Inversión Total" value={summary.totalInvestment} colorClass="text-slate-800 dark:text-slate-200" />
                <StatCard title="Ingresos" value={summary.totalRevenue} colorClass="text-emerald-600 dark:text-emerald-400" />
                <StatCard title="Gastos" value={summary.totalExpenses} colorClass="text-rose-600 dark:text-rose-400" />
                <StatCard title="Beneficio Neto" value={summary.totalProfit} colorClass={summary.totalProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Contenedor del gráfico de barras corregido */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 h-96 flex flex-col">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex-shrink-0">Gastos por Categoría</h3>
                    <div className="relative flex-grow">
                        <Bar data={expensesByCategoryData} options={chartOptions} />
                    </div>
                </div>
                {/* Contenedor del gráfico circular corregido */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 h-96 flex flex-col">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex-shrink-0">Coches por Estado</h3>
                    <div className="relative flex-grow">
                        <Pie data={statusData} options={pieOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
