// autogest-app/frontend/src/pages/Expenses.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPlusCircle, faCar, faTrash, faCalendarDay, faTag, faEuroSign, faPaperclip, faEdit } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Expenses = ({ expenses, onAddExpense, onEditExpense, onDeleteExpense }) => {
    const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text("Resumen de Gastos Generales", 14, 16);
        autoTable(doc, {
            startY: 20,
            head: [['Fecha', 'Categoría', 'Importe', 'Descripción']],
            body: expenses.map(exp => [
                new Date(exp.date).toLocaleDateString('es-ES'),
                exp.category,
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(exp.amount),
                exp.description
            ]),
        });
        doc.save('resumen_gastos_generales.pdf');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Gastos Generales</h1>
                <div className="flex gap-4">
                    <button
                        onClick={onAddExpense}
                        className="bg-blue-accent text-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                        title="Añadir nuevo gasto general"
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
                    {/* --- VISTA DE TARJETAS PARA MÓVIL --- */}
                    <div className="space-y-4 md:hidden">
                        {expenses.map(expense => (
                            <div key={expense.id} className="bg-component-bg rounded-xl border border-border-color p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="text-sm text-text-secondary space-y-1">
                                        <p className="flex items-center gap-2"><FontAwesomeIcon icon={faCalendarDay} />{new Date(expense.date).toLocaleDateString('es-ES')}</p>
                                        <p className="flex items-center gap-2"><FontAwesomeIcon icon={faTag} />{expense.category}</p>
                                    </div>
                                    <p className="font-bold text-text-primary text-xl">€ {new Intl.NumberFormat('es-ES').format(expense.amount)}</p>
                                </div>

                                {expense.description && <p className="text-sm text-text-primary pt-3 border-t border-border-color">{expense.description}</p>}

                                <div className="flex justify-between items-end pt-3 border-t border-border-color">
                                    <div className="flex items-center gap-2">
                                        {expense.attachments && expense.attachments.map((fileUrl, index) => (
                                            <a href={`${API_BASE_URL}${fileUrl.path}`} target="_blank" rel="noopener noreferrer" key={index} className="text-blue-accent hover:opacity-75 transition-opacity" title={fileUrl.originalname || `Ver adjunto ${index + 1}`}>
                                                <FontAwesomeIcon icon={faPaperclip} />
                                            </a>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onEditExpense(expense)} className="text-blue-accent hover:opacity-80 transition-opacity p-2" title="Editar gasto">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button onClick={() => onDeleteExpense(expense)} className="text-red-accent hover:opacity-80 transition-opacity p-2 flex-shrink-0" title="Eliminar gasto">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
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
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Fecha</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Categoría</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Importe</th>
                                        <th scope="col" className="px-6 py-4">Descripción</th>
                                        <th scope="col" className="px-6 py-4">Adjuntos</th>
                                        <th scope="col" className="px-6 py-4"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {expenses.map(expense => (
                                        <tr key={expense.id} className="hover:bg-component-bg-hover">
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(expense.date).toLocaleDateString('es-ES')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium px-2.5 py-1 rounded-full">{expense.category}</span></td>
                                            <td className="px-6 py-4 font-bold text-text-primary whitespace-nowrap">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</td>
                                            <td className="px-6 py-4">{expense.description}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {expense.attachments && expense.attachments.map((file, index) => (
                                                        <a href={`${API_BASE_URL}${file.path}`} target="_blank" rel="noopener noreferrer" key={index} className="text-blue-accent hover:opacity-75 transition-opacity" title={file.originalname || `Ver adjunto ${index + 1}`}>
                                                            <FontAwesomeIcon icon={faPaperclip} />
                                                        </a>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => onEditExpense(expense)} className="text-blue-accent hover:opacity-80 transition-opacity mr-4" title="Editar gasto">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button onClick={() => onDeleteExpense(expense)} className="text-red-accent hover:opacity-80 transition-opacity" title="Eliminar gasto">
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
                    <FontAwesomeIcon icon={faEuroSign} className="text-5xl text-zinc-500 dark:text-zinc-700 mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary">Aún no hay gastos generales</h3>
                    <p className="text-text-secondary mt-2">Cuando añadas tu primer gasto general (luz, agua, alquiler...), aparecerá aquí.</p>
                </div>
            )}
        </div>
    );
};

export default Expenses;