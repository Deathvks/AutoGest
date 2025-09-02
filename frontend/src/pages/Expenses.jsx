// autogest-app/frontend/src/pages/Expenses.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPlusCircle, faCar, faTrash, faCalendarDay, faTag, faEuroSign, faEdit } from '@fortawesome/free-solid-svg-icons';

const Expenses = ({ expenses, cars, onAddExpense, onEditExpense, onDeleteExpense }) => {
    useEffect(() => {
        // Carga de scripts para PDF (se mantiene igual)
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

    const getCarNameAndPlate = (licensePlate) => {
        const car = cars.find(c => c.licensePlate === licensePlate);
        return car ? `${car.make} ${car.model}\n${car.licensePlate}` : 'General';
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
                    getCarNameAndPlate(exp.carLicensePlate).replace('\n', ' '), // Para PDF, mejor en una línea
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

    return (
        <div>
            {/* --- HEADER COMO EN IMAGE 1 --- */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Gastos</h1>
                <div className="flex gap-4">
                    <button 
                        onClick={onAddExpense}
                        disabled={noCarsRegistered}
                        className="bg-blue-accent text-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:bg-slate-400 disabled:cursor-not-allowed"
                        title={noCarsRegistered ? "Debes registrar al menos un coche para añadir un gasto" : "Añadir nuevo gasto"}
                    >
                        <FontAwesomeIcon icon={faPlusCircle} className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={generatePDF}
                        disabled={expenses.length === 0}
                        className="bg-component-bg text-text-secondary w-12 h-12 flex items-center justify-center rounded-xl hover:bg-component-bg-hover transition-colors border border-border-color disabled:opacity-50 disabled:cursor-not-allowed"
                        title={expenses.length === 0 ? "No hay gastos para exportar" : "Generar PDF"}
                    >
                        <FontAwesomeIcon icon={faDownload} className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {expenses.length > 0 ? (
                <>
                    {/* --- VISTA DE TARJETAS PARA MÓVIL (AJUSTADA A IMAGE 2) --- */}
                    <div className="space-y-4 md:hidden">
                        {expenses.map(expense => (
                            <div key={expense.id} className="bg-component-bg rounded-xl border border-border-color p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-text-secondary">
                                            <p className="flex items-center gap-2"><FontAwesomeIcon icon={faCalendarDay} />{new Date(expense.date).toLocaleDateString('es-ES')}</p>
                                            <p className="flex items-center gap-2 mt-1"><FontAwesomeIcon icon={faTag} />{expense.category}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-text-primary text-xl">€ {new Intl.NumberFormat('es-ES').format(expense.amount)}</p>
                                </div>
                                
                                <div className="flex justify-between items-end pt-3 border-t border-border-color">
                                    <div className="text-sm text-text-primary">
                                        <p className="font-medium flex items-center gap-2"><FontAwesomeIcon icon={faCar} />{getCarNameAndPlate(expense.carLicensePlate).split('\n')[0]}</p>
                                        <p className="text-text-secondary ml-6">{getCarNameAndPlate(expense.carLicensePlate).split('\n')[1]}</p>
                                    </div>
                                    {/* --- BOTONES DE ACCIÓN MÓVIL --- */}
                                    <div className="flex items-center">
                                        <button onClick={() => onEditExpense(expense)} className="text-blue-accent hover:opacity-80 transition-opacity p-2">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button onClick={() => onDeleteExpense(expense)} className="text-red-accent hover:opacity-80 transition-opacity p-2">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- VISTA DE TABLA PARA ESCRITORIO (Mantiene el deslizamiento) --- */}
                    <div className="hidden md:block bg-component-bg rounded-xl border border-border-color overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs uppercase bg-component-bg-hover">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Fecha</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Categoría</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Importe</th>
                                        <th scope="col" className="px-6 py-4">Coche Asociado</th>
                                        <th scope="col" className="px-6 py-4">Descripción</th>
                                        <th scope="col" className="px-6 py-4"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {expenses.map(expense => (
                                        <tr key={expense.id} className="hover:bg-component-bg-hover">
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(expense.date).toLocaleDateString('es-ES')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium px-2.5 py-1 rounded-full">{expense.category}</span></td>
                                            <td className="px-6 py-4 font-bold text-text-primary whitespace-nowrap">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</td>
                                            <td className="px-6 py-4">{getCarNameAndPlate(expense.carLicensePlate).replace('\n', ' ')}</td>
                                            <td className="px-6 py-4">{expense.description}</td>
                                            <td className="px-6 py-4 text-right">
                                                {/* --- BOTONES DE ACCIÓN ESCRITORIO --- */}
                                                <button onClick={() => onEditExpense(expense)} className="text-blue-accent hover:opacity-80 transition-opacity mr-4">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
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
                </>
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