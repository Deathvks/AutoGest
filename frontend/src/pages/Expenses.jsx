// autogest-app/frontend/src/pages/Expenses.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPlusCircle, faCar, faTrash } from '@fortawesome/free-solid-svg-icons';

const Expenses = ({ expenses, cars, onAddExpense, onDeleteExpense }) => {
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

    const getCarName = (licensePlate) => {
        const car = cars.find(c => c.licensePlate === licensePlate);
        return car ? `${car.make} ${car.model} (${car.licensePlate})` : 'General';
    };

    const generatePDF = () => {
        if (window.jspdf && window.jspdf.jsPDF) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text("Resumen de Gastos", 14, 16);
            doc.autoTable({
                startY: 20,
                head: [['Fecha', 'Categoría', 'Importe', 'Coche Asociado', 'Descripción']],
                body: expenses.map(exp => [
                    new Date(exp.date).toLocaleDateString('es-ES'), 
                    exp.category,
                    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(exp.amount),
                    getCarName(exp.carLicensePlate),
                    exp.description
                ]),
            });
            doc.save('resumen_gastos.pdf');
        } else {
            console.error("La librería jsPDF no está cargada todavía.");
            alert("La función para exportar a PDF no está lista, por favor inténtalo de nuevo en unos segundos.");
        }
    };

    const noCarsRegistered = cars.length === 0;
    const noExpenses = expenses.length === 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Gastos</h1>
                <div className="flex gap-4">
                    <button 
                        onClick={onAddExpense}
                        disabled={noCarsRegistered}
                        className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        title={noCarsRegistered ? "Debes registrar al menos un coche para añadir un gasto" : "Añadir nuevo gasto"}
                    >
                        <FontAwesomeIcon icon={faPlusCircle} className="w-5 h-5" />
                        <span className="hidden sm:inline">Añadir Gasto</span>
                    </button>
                    <button 
                        onClick={generatePDF}
                        disabled={noExpenses}
                        className="bg-component-bg text-text-secondary px-4 py-2 rounded-lg hover:bg-component-bg-hover transition-colors flex items-center gap-2 border border-border-color disabled:opacity-50 disabled:cursor-not-allowed"
                        title={noExpenses ? "No hay gastos para exportar" : "Generar PDF"}
                    >
                        <FontAwesomeIcon icon={faDownload} className="w-5 h-5" />
                        <span className="hidden sm:inline">Generar PDF</span>
                    </button>
                </div>
            </div>

            {expenses.length > 0 ? (
                <div className="bg-component-bg rounded-xl border border-border-color overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-component-bg-hover">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Fecha</th>
                                    <th scope="col" className="px-6 py-4">Categoría</th>
                                    <th scope="col" className="px-6 py-4">Importe</th>
                                    <th scope="col" className="px-6 py-4">Coche Asociado</th>
                                    <th scope="col" className="px-6 py-4">Descripción</th>
                                    <th scope="col" className="px-6 py-4"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {expenses.map(expense => (
                                    <tr key={expense.id} className="hover:bg-component-bg-hover">
                                        <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString('es-ES')}</td>
                                        <td className="px-6 py-4"><span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium mr-2 px-2.5 py-1 rounded-full">{expense.category}</span></td>
                                        <td className="px-6 py-4 font-bold text-text-primary">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</td>
                                        <td className="px-6 py-4">{getCarName(expense.carLicensePlate)}</td>
                                        <td className="px-6 py-4">{expense.description}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => onDeleteExpense(expense)} className="text-red-accent hover:opacity-80 transition-opacity">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 px-4 bg-component-bg rounded-xl border border-border-color">
                    <FontAwesomeIcon icon={faCar} className="text-5xl text-zinc-500 dark:text-zinc-700 mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary">Aún no hay gastos</h3>
                    {noCarsRegistered ? (
                        <>
                            <p className="text-text-secondary mt-2">Para poder registrar un gasto, primero necesitas añadir un coche.</p>
                            <Link to="/cars" className="mt-4 inline-flex items-center gap-2 bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                                <FontAwesomeIcon icon={faPlusCircle} />
                                Añadir mi primer coche
                            </Link>
                        </>
                    ) : (
                        <p className="text-text-secondary mt-2">Cuando añadas tu primer gasto, aparecerá aquí.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Expenses;