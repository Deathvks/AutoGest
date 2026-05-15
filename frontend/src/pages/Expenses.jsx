// autogest-app/frontend/src/pages/Expenses.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPlus, faTrash, faCalendarDay, faTag, faEuroSign, faPaperclip, faEdit, faSync } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Expenses = ({ expenses, onAddExpense, onEditExpense, onDeleteExpense }) => {
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#020B1C] tracking-tight uppercase">Gastos Generales</h1>
                <div className="flex gap-3">
                    <button
                        onClick={generatePDF}
                        disabled={expenses.length === 0}
                        className="bg-white text-gray-700 w-11 h-11 flex items-center justify-center rounded-[14px] hover:bg-gray-50 transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        title={expenses.length === 0 ? "No hay gastos para exportar" : "Generar PDF"}
                    >
                        <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                    </button>
                    {/* Botón normal de escritorio oculto en móvil */}
                    <button
                        onClick={onAddExpense}
                        className="hidden sm:flex bg-[#ED123A] text-white w-11 h-11 items-center justify-center rounded-[14px] shadow-md hover:bg-[#C90E30] hover:-translate-y-0.5 transition-all"
                        title="Añadir nuevo gasto general"
                    >
                        <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {expenses.length > 0 ? (
                <>
                    {/* --- VISTA DE TARJETAS PARA MÓVIL --- */}
                    <div className="space-y-4 md:hidden pb-10">
                        {expenses.map(expense => (
                            <div key={expense.id} className="bg-white rounded-[14px] border border-gray-200 p-4 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            <FontAwesomeIcon icon={faCalendarDay} />
                                            {new Date(expense.date).toLocaleDateString('es-ES')}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faTag} className="text-gray-400 text-xs" />
                                            <span className="font-bold text-[#020B1C] uppercase text-sm">{expense.category}</span>
                                            {expense.isRecurring && (
                                                <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100" title="Gasto recurrente">
                                                    <FontAwesomeIcon icon={faSync} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="font-bold text-[#ED123A] text-lg">- {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</p>
                                </div>

                                {expense.description && (
                                    <p className="text-sm text-gray-600 pt-3 mt-2 border-t border-gray-100">
                                        {expense.description}
                                    </p>
                                )}

                                <div className="flex justify-between items-end pt-3 mt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-3">
                                        {expense.attachments && expense.attachments.map((fileUrl, index) => (
                                            <a
                                                href={fileUrl.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                key={index}
                                                className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-semibold hover:bg-blue-100 transition-colors"
                                                title={fileUrl.originalname || `Ver adjunto ${index + 1}`}
                                            >
                                                <FontAwesomeIcon icon={faPaperclip} className="mr-1" />
                                                Adjunto {index + 1}
                                            </a>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEditExpense(expense)}
                                            className="text-gray-400 hover:text-[#020B1C] transition-colors p-2 rounded hover:bg-gray-50"
                                            title="Editar gasto"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteExpense(expense)}
                                            className="text-gray-400 hover:text-[#ED123A] transition-colors p-2 rounded hover:bg-gray-50"
                                            title="Eliminar gasto"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- VISTA DE TABLA PARA ESCRITORIO --- */}
                    <div className="hidden md:block bg-white rounded-[14px] border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs uppercase bg-gray-50 text-[#020B1C] font-bold border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Fecha</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Categoría</th>
                                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Importe</th>
                                        <th scope="col" className="px-6 py-4">Descripción</th>
                                        <th scope="col" className="px-6 py-4">Adjuntos</th>
                                        <th scope="col" className="px-6 py-4 text-right"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {expenses.map(expense => (
                                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                {new Date(expense.date).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="flex items-center gap-2 w-fit bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded border border-gray-200 uppercase">
                                                    {expense.category}
                                                    {expense.isRecurring && <FontAwesomeIcon icon={faSync} className="text-blue-500" title="Gasto recurrente" />}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-[#ED123A] whitespace-nowrap">
                                                - {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={expense.description}>
                                                {expense.description}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {expense.attachments && expense.attachments.map((file, index) => (
                                                        <a
                                                            href={file.path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            key={index}
                                                            className="text-gray-400 hover:text-[#020B1C] transition-colors"
                                                            title={file.originalname || `Ver adjunto ${index + 1}`}
                                                        >
                                                            <FontAwesomeIcon icon={faPaperclip} />
                                                        </a>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button onClick={() => onEditExpense(expense)} className="text-gray-400 hover:text-[#020B1C] transition-colors mr-3" title="Editar gasto">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button onClick={() => onDeleteExpense(expense)} className="text-gray-400 hover:text-[#ED123A] transition-colors" title="Eliminar gasto">
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
                <div className="text-center py-20 px-4 bg-white rounded-[14px] border border-gray-200 border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        <FontAwesomeIcon icon={faEuroSign} className="text-3xl text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-[#020B1C]">Aún no hay gastos generales</h3>
                    <p className="text-gray-500 mt-2">Cuando añadas tu primer gasto general (luz, agua, alquiler...), aparecerá aquí.</p>
                </div>
            )}

            {/* --- BOTÓN FLOTANTE PARA MÓVIL --- */}
            <button
                onClick={onAddExpense}
                className="sm:hidden fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#ED123A] text-white rounded-full shadow-[0_4px_14px_rgba(237,18,58,0.4)] hover:bg-[#C90E30] hover:scale-105 active:scale-95 transition-all"
                aria-label="Añadir gasto"
            >
                <FontAwesomeIcon icon={faPlus} className="w-6 h-6" />
            </button>
        </div>
    );
};

export default Expenses;