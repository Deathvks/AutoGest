// autogest-app/frontend/src/pages/Dashboard.jsx
import React, { useMemo, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// --- Configuración de Chart.js ---
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

const Dashboard = ({ cars, expenses, isDarkMode, onTotalInvestmentClick, onRevenueClick }) => {
    useEffect(() => {
        // Actualizamos los colores por defecto de los gráficos al cambiar el tema
        const textColor = isDarkMode ? '#94a3b8' : '#64748b';
        const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
        ChartJS.defaults.color = textColor;
        ChartJS.defaults.borderColor = gridColor;
    }, [isDarkMode]);

    const summary = useMemo(() => {
        // Nos aseguramos de que todos los valores sean numéricos antes de sumar
        const soldCars = cars.filter(c => c.status === 'Vendido');
        
        const totalRevenue = soldCars.reduce((sum, car) => sum + parseFloat(car.salePrice || 0), 0);
        
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

        const totalPurchasePriceAllCars = cars.reduce((sum, car) => sum + parseFloat(car.purchasePrice || 0), 0);

        const purchasePriceOfSoldCars = soldCars.reduce((sum, car) => sum + parseFloat(car.purchasePrice || 0), 0);
        
        // --- LÓGICA CORREGIDA ---
        const totalInvestment = totalPurchasePriceAllCars + totalExpenses;
        const totalProfit = totalRevenue - (purchasePriceOfSoldCars + totalExpenses);

        return {
            totalInvestment,
            totalRevenue,
            totalExpenses,
            totalProfit,
        };
    }, [cars, expenses]);

    const expensesByCategoryData = useMemo(() => {
        const categories = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount || 0);
            return acc;
        }, {});
        
        const backgroundColors = isDarkMode ? 'rgba(197, 164, 126, 0.5)' : 'rgba(184, 134, 11, 0.6)';
        const borderColors = isDarkMode ? '#C5A47E' : '#B8860B';

        return {
            labels: Object.keys(categories),
            datasets: [{ 
                label: 'Gastos', 
                data: Object.values(categories), 
                backgroundColor: backgroundColors, 
                borderColor: borderColors, 
                borderWidth: 1,
                borderRadius: 4,
            }],
        };
    }, [expenses, isDarkMode]);
    
    const statusData = useMemo(() => {
        const statusCounts = {};
        
        const orderedStatuses = ['En venta', 'Reservado', 'Vendido', 'Otro']; 
        orderedStatuses.forEach(status => statusCounts[status] = 0);

        cars.forEach(car => {
            if (orderedStatuses.includes(car.status)) {
                statusCounts[car.status]++;
            } else {
                statusCounts['Otro']++;
            }
        });
        
        const rootStyles = getComputedStyle(document.documentElement);
        const accentColor = rootStyles.getPropertyValue('--color-accent').trim();

        const colors = {
            'En venta': accentColor, // Color del navbar seleccionado (accent)
            'Reservado': isDarkMode ? '#FFA500' : '#FF8C00', // Naranja
            'Vendido': isDarkMode ? '#00FF00' : '#32CD32',   // Verde
            'Otro': isDarkMode ? '#94a3b8' : '#64748b'       // Gris para "Otro"
        };

        const labels = Object.keys(statusCounts);
        const data = Object.values(statusCounts);
        const backgroundColors = labels.map(label => colors[label]);

        return {
            labels: labels,
            datasets: [{ 
                data: data, 
                backgroundColor: backgroundColors, 
                borderColor: 'var(--color-component-bg)'
            }],
        };
    }, [cars, isDarkMode]);

    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    const pieOptions = { ...chartOptions, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } } };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    title="Inversión Total" 
                    value={summary.totalInvestment} 
                    colorClass="text-text-primary" 
                    onClick={onTotalInvestmentClick} 
                    isClickable={true} 
                />
                <StatCard 
                    title="Ingresos" 
                    value={summary.totalRevenue} 
                    colorClass="text-green-accent" 
                    onClick={onRevenueClick}
                    isClickable={true}
                />
                <StatCard title="Gastos" value={summary.totalExpenses} colorClass="text-red-accent" />
                <StatCard title="Beneficio Neto" value={summary.totalProfit} colorClass={summary.totalProfit >= 0 ? 'text-accent' : 'text-red-accent'} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-component-bg p-6 rounded-lg shadow-sm border border-border-color h-96 flex flex-col">
                    <h3 className="font-semibold text-text-primary mb-4 flex-shrink-0">Gastos por Categoría</h3>
                    <div className="relative flex-grow">
                        <Bar data={expensesByCategoryData} options={chartOptions} />
                    </div>
                </div>
                <div className="lg:col-span-2 bg-component-bg p-6 rounded-lg shadow-sm border border-border-color h-96 flex flex-col">
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