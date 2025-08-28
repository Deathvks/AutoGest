// autogest-app/frontend/src/pages/SalesSummary.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTags, faCar, faCalendarDay, faEuroSign } from '@fortawesome/free-solid-svg-icons';

const SalesSummary = ({ cars, onViewDetailsClick }) => {
    useEffect(() => {
        const jspdfScript = document.createElement('script');
        jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        jspdfScript.async = true;
        
        jspdfScript.onload = () => {
            const autotableScript = document.createElement('script');
            autotableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
            autotableScript.async = true;
            document.head.appendChild(autotableScript);
        };
        document.head.appendChild(jspdfScript);
    }, []);

    const soldCars = cars.filter(car => car.status === 'Vendido');

    const generatePDF = () => {
        if (window.jspdf && window.jspdf.jsPDF) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.text("Resumen de Ventas", 14, 16);
            doc.autoTable({
                startY: 20,
                head: [['Modelo', 'Matrícula', 'Precio Compra', 'Precio Venta', 'Margen']],
                body: soldCars.map(car => [
                    `${car.make} ${car.model}`,
                    car.licensePlate,
                    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice),
                    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice),
                    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice - car.purchasePrice)
                ]),
            });
            doc.save('resumen_ventas.pdf');
        } else {
            console.error("La librería jsPDF no está cargada todavía.");
            alert("La función para exportar a PDF no está lista, por favor inténtalo de nuevo en unos segundos.");
        }
    };
    
    const noSoldCars = soldCars.length === 0;

    return (
        <div>
            {/* --- HEADER COMO EN GASTOS --- */}
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

            {soldCars.length > 0 ? (
                <>
                    {/* --- VISTA DE TARJETAS PARA MÓVIL (COMO EN GASTOS) --- */}
                    <div className="space-y-4 md:hidden">
                        {soldCars.map(car => (
                            <div 
                                key={car.id} 
                                className="bg-component-bg rounded-xl border border-border-color p-4 cursor-pointer hover:bg-component-bg-hover transition-colors"
                                onClick={() => onViewDetailsClick(car)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={car.imageUrl || `https://placehold.co/600x400/e2e8f0/1e293b?text=${car.make}+${car.model}`} 
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
                                        <p className="font-bold text-green-accent text-lg">
                                            +{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice - car.purchasePrice)}
                                        </p>
                                        <p className="text-xs text-text-secondary">Margen</p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-3 border-t border-border-color">
                                    <div className="text-sm">
                                        <p className="text-text-secondary">Compra: <span className="text-text-primary font-medium">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}</span></p>
                                    </div>
                                    <div className="text-sm text-right">
                                        <p className="text-text-secondary">Venta: <span className="text-text-primary font-medium">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- VISTA DE TABLA PARA ESCRITORIO --- */}
                    <div className="hidden md:block bg-component-bg rounded-xl border border-border-color overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs uppercase bg-component-bg-hover">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Coche</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Matrícula</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Precio Compra</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Precio Venta</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Margen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {soldCars.map(car => (
                                        <tr 
                                            key={car.id} 
                                            className="cursor-pointer hover:bg-component-bg-hover transition-colors"
                                            onClick={() => onViewDetailsClick(car)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={car.imageUrl || `https://placehold.co/600x400/e2e8f0/1e293b?text=${car.make}+${car.model}`} 
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
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-green-accent whitespace-nowrap">
                                                +{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice - car.purchasePrice)}
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