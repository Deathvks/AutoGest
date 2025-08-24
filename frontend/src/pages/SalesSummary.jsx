import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTags, faCar } from '@fortawesome/free-solid-svg-icons';

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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Resumen de Ventas</h1>
                <button 
                    onClick={generatePDF} 
                    disabled={noSoldCars}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                    title={noSoldCars ? "No hay ventas para exportar" : "Generar PDF"}
                >
                    <FontAwesomeIcon icon={faDownload} className="w-5 h-5" />
                    <span className="hidden sm:inline">Exportar PDF</span>
                </button>
            </div>

            {soldCars.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Coche</th>
                                    <th scope="col" className="px-6 py-4">Matrícula</th>
                                    <th scope="col" className="px-6 py-4">Precio Compra</th>
                                    <th scope="col" className="px-6 py-4">Precio Venta</th>
                                    <th scope="col" className="px-6 py-4">Margen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {soldCars.map(car => (
                                    <tr 
                                        key={car.id} 
                                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                        onClick={() => onViewDetailsClick(car)}
                                    >
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <img src={car.imageUrl || `https://placehold.co/600x400/e2e8f0/1e293b?text=${car.make}+${car.model}`} className="w-16 h-10 object-cover rounded-md" alt={`${car.make} ${car.model}`} />
                                                <div>
                                                    <p>{car.make} {car.model}</p>
                                                    <p className="text-xs text-slate-500">{new Date(car.registrationDate).getFullYear()}</p>
                                                </div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">{car.licensePlate}</td>
                                        <td className="px-6 py-4">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}</td>
                                        <td className="px-6 py-4">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice - car.purchasePrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <FontAwesomeIcon icon={faTags} className="text-5xl text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Aún no hay ventas registradas</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Cuando vendas tu primer coche, aparecerá aquí el resumen.</p>
                    <Link to="/cars" className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                        <FontAwesomeIcon icon={faCar} />
                        Ver mis coches
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SalesSummary;