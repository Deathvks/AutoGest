// autogest-app/frontend/src/pages/Dashboard.jsx
import React, { useMemo, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// --- Configuración de Chart.js ---
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatCard = ({ title, value, colorClass }) => (
    <div className="bg-component-bg p-6 rounded-xl border border-border-color">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)}</p>
    </div>
);

const Dashboard = ({ cars, expenses, isDarkMode }) => {
    useEffect(() => {
        // Actualizamos los colores por defecto de los gráficos al cambiar el tema
        const textColor = isDarkMode ? '#a1a1aa' : '#475569'; // text-secondary
        const gridColor = isDarkMode ? '#2A2A35' : '#e2e8f0'; // border-color
        ChartJS.defaults.color = textColor;
        ChartJS.defaults.borderColor = gridColor;
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
        
        const backgroundColors = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(37, 99, 235, 0.6)'; // blue-accent with opacity
        const borderColors = isDarkMode ? '#60a5fa' : '#2563eb'; // blue-accent

        return {
            labels: Object.keys(categories),
            datasets: [{ 
                label: 'Gastos', 
                data: Object.values(categories), 
                backgroundColor: backgroundColors, 
                borderColor: borderColors, 
                borderWidth: 1 
            }],
        };
    }, [expenses, isDarkMode]);
    
    const statusData = useMemo(() => {
        const statuses = cars.reduce((acc, car) => {
            acc[car.status] = (acc[car.status] || 0) + 1;
            return acc;
        }, {});
        
        const backgroundColors = isDarkMode
            ? ['#60a5fa', '#4ade80', '#facc15', '#f87171'] // blue-accent, green-accent, yellow-accent, red-accent
            : ['#2563eb', '#16a34a', '#d97706', '#dc2626'];
        
        return {
            labels: Object.keys(statuses),
            datasets: [{ 
                data: Object.values(statuses), 
                backgroundColor: backgroundColors, 
                borderColor: isDarkMode ? '#000000' : '#f1f5f9' // background color
            }],
        };
    }, [cars, isDarkMode]);

    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    const pieOptions = { ...chartOptions, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } } };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Inversión Total" value={summary.totalInvestment} colorClass="text-text-primary" />
                <StatCard title="Ingresos" value={summary.totalRevenue} colorClass="text-green-accent" />
                <StatCard title="Gastos" value={summary.totalExpenses} colorClass="text-red-accent" />
                <StatCard title="Beneficio Neto" value={summary.totalProfit} colorClass={summary.totalProfit >= 0 ? 'text-blue-accent' : 'text-red-accent'} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-component-bg p-6 rounded-xl border border-border-color h-96 flex flex-col">
                    <h3 className="font-semibold text-text-primary mb-4 flex-shrink-0">Gastos por Categoría</h3>
                    <div className="relative flex-grow">
                        <Bar data={expensesByCategoryData} options={chartOptions} />
                    </div>
                </div>
                <div className="lg:col-span-2 bg-component-bg p-6 rounded-xl border border-border-color h-96 flex flex-col">
                    <h3 className="font-semibold text-text-primary mb-4 flex-shrink-0">Coches por Estado</h3>
                    <div className="relative flex-grow">
                        <Pie data={statusData} options={pieOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;