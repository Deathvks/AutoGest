// autogest-app/frontend/src/pages/SalesSummary.jsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTags, faCar, faCalendarDay, faEuroSign, faWrench } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SalesSummary = ({ cars, expenses, onViewDetailsClick }) => {

    const soldCarsWithProfit = useMemo(() => {
        return cars
            .filter(car => car.status === 'Vendido')
            .map(car => {
                const associatedExpenses = expenses.filter(
                    exp => exp.carLicensePlate === car.licensePlate
                );
                const totalExpenses = associatedExpenses.reduce(
                    (sum, exp) => sum + (parseFloat(exp.amount) || 0),
                    0
                );
                const profit = (parseFloat(car.salePrice) || 0) - (parseFloat(car.purchasePrice) || 0) - totalExpenses;
                return { ...car, totalExpenses, profit };
            });
    }, [cars, expenses]);

    const generatePDF = () => {
        const doc = new jsPDF();
        
        doc.text("Resumen de Ventas", 14, 16);
        autoTable(doc, {
            startY: 20,
            head: [['Modelo', 'Matrícula', 'Precio Compra', 'Gastos', 'Precio Venta', 'Beneficio/Pérdida']],
            body: soldCarsWithProfit.map(car => [
                `${car.make} ${car.model}`,
                car.licensePlate,
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice),
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.totalExpenses),
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice),
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.profit)
            ]),
        });
        doc.save('resumen_ventas.pdf');
    };
    
    const noSoldCars = soldCarsWithProfit.length === 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Resumen de Ventas</h1>
                <button 
                    onClick={generatePDF} 
                    disabled={noSoldCars}
                    className="bg-component-bg text-text-secondary w-12 h-12 flex items-center justify-center rounded-xl hover:bg-component-bg-hover transition-colors border border-border-color disabled:opacity-50 disabled:cursor-not-allowed"
                    title={noSoldCars ? "No hay ventas para exportar" : "Generar PDF"}
                >
                    <FontAwesomeIcon icon={faDownload} className="w-6 h-6" />
                </button>
            </div>

            {soldCarsWithProfit.length > 0 ? (
                <>
                    <div className="space-y-4 md:hidden">
                        {soldCarsWithProfit.map(car => (
                            <div 
                                key={car.id} 
                                className="bg-component-bg rounded-xl border border-border-color p-4 cursor-pointer hover:bg-component-bg-hover transition-colors"
                                onClick={() => onViewDetailsClick(car)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={car.imageUrl ? `${import.meta.env.PROD ? '' : 'http://localhost:3001'}${car.imageUrl}` : `https://placehold.co/600x400/e2e8f0/1e293b?text=${car.make}+${car.model}`} 
                                            className="w-16 h-12 object-cover rounded-md flex-shrink-0" 
                                            alt={`${car.make} ${car.model}`} 
                                        />
                                        <div>
                                            <p className="font-semibold text-text-primary">{car.make} {car.model}</p>
                                            <p className="text-sm text-text-secondary flex items-center gap-1">
                                                <FontAwesomeIcon icon={faCalendarDay} className="w-3 h-3" />
                                                {new Date(car.registrationDate).getFullYear()}
                                            </p>
                                            <p className="text-sm text-text-secondary">{car.licensePlate}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${car.profit >= 0 ? 'text-green-accent' : 'text-red-accent'}`}>
                                            {car.profit >= 0 ? '+' : ''}{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.profit)}
                                        </p>
                                        <p className="text-xs text-text-secondary">Beneficio/Pérdida</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 items-center pt-3 border-t border-border-color text-sm">
                                    <div className="text-left">
                                        <p className="text-text-secondary">Compra:</p>
                                        <p className="text-text-primary font-medium">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}</p>
                                    </div>
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

                    <div className="hidden md:block bg-component-bg rounded-xl border border-border-color overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs uppercase bg-component-bg-hover">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Coche</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Matrícula</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Precio Compra</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Gastos</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Precio Venta</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Beneficio/Pérdida</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {soldCarsWithProfit.map(car => (
                                        <tr 
                                            key={car.id} 
                                            className="cursor-pointer hover:bg-component-bg-hover transition-colors"
                                            onClick={() => onViewDetailsClick(car)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={car.imageUrl ? `${import.meta.env.PROD ? '' : 'http://localhost:3001'}${car.imageUrl}` : `https://placehold.co/600x400/e2e8f0/1e293b?text=${car.make}+${car.model}`} 
                                                        className="w-16 h-10 object-cover rounded-md" 
                                                        alt={`${car.make} ${car.model}`} 
                                                    />
                                                    <div>
                                                        <p className="font-medium text-text-primary">{car.make} {car.model}</p>
                                                        <p className="text-xs text-text-secondary">{new Date(car.registrationDate).getFullYear()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    {car.licensePlate}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.totalExpenses)}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}
                                            </td>
                                            <td className={`px-6 py-4 font-bold whitespace-nowrap ${car.profit >= 0 ? 'text-green-accent' : 'text-red-accent'}`}>
                                                {car.profit >= 0 ? '+' : ''}{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.profit)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-16 px-4 bg-component-bg rounded-xl border border-border-color">
                    <FontAwesomeIcon icon={faTags} className="text-5xl text-zinc-500 dark:text-zinc-600 mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary">Aún no hay ventas registradas</h3>
                    <p className="text-text-secondary mt-2">Cuando vendas tu primer coche, aparecerá aquí el resumen.</p>
                    <Link to="/cars" className="mt-4 inline-flex items-center gap-2 bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                        <FontAwesomeIcon icon={faCar} />
                        Ver mis coches
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SalesSummary;