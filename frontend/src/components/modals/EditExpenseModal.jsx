// autogest-app/frontend/src/components/modals/EditExpenseModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faTag, faPaperclip, faSync, faCheck, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';
import DatePicker from '../DatePicker';

const InputField = ({ label, name, value, onChange, type = 'text', icon, placeholder }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">{label}</label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" />
                </div>
            )}
            <input
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors ${icon ? 'pl-11' : ''}`}
            />
        </div>
    </div>
);

const TextareaField = ({ label, name, value, onChange, placeholder }) => {
    const textareaRef = useRef(null);
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">{label}</label>
            <textarea 
                ref={textareaRef} 
                name={name} 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder} 
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 resize-none overflow-hidden" 
                rows="3" 
            />
        </div>
    );
};

const EditExpenseModal = ({ expense, onClose, onUpdate }) => {
    const [editedExpense, setEditedExpense] = useState({
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
        category: expense.category,
        customCategory: '',
        amount: expense.amount || '',
        description: expense.description || '',
        isRecurring: expense.isRecurring || false,
        recurrenceType: expense.recurrenceType || 'monthly',
        recurrenceCustomValue: expense.recurrenceCustomValue || '',
        recurrenceEndDate: expense.recurrenceEndDate ? new Date(expense.recurrenceEndDate).toISOString().split('T')[0] : '',
    });
    const [attachments, setAttachments] = useState([]);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const categoryOptions = [
        { id: 'Mecánica', name: 'Mecánica' },
        { id: 'Limpieza', name: 'Limpieza' },
        { id: 'Gestoría', name: 'Gestoría' },
        { id: 'Combustible', name: 'Combustible' },
        { id: 'Otros', name: 'Otros' },
    ];

    const recurrenceOptions = [
        { id: 'daily', name: 'Diariamente' },
        { id: 'weekly', name: 'Semanalmente' },
        { id: 'monthly', name: 'Mensualmente' },
        { id: 'custom', name: 'Personalizado (días)' },
    ];

    useEffect(() => {
        const isStandardCategory = categoryOptions.some(opt => opt.id === expense.category);
        if (!isStandardCategory) {
            setEditedExpense(prev => ({ ...prev, category: 'Otros', customCategory: expense.category }));
        }
    }, [expense]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setEditedExpense(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSelectChange = (name, value) => {
        setEditedExpense(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setAttachments([...e.target.files]);
    };

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            const finalCategory = editedExpense.category === 'Otros' ? editedExpense.customCategory.trim() : editedExpense.category;

            formData.append('date', editedExpense.date);
            formData.append('category', finalCategory);
            formData.append('amount', editedExpense.amount);
            formData.append('description', editedExpense.description);

            formData.append('isRecurring', editedExpense.isRecurring);
            if (editedExpense.isRecurring) {
                formData.append('recurrenceType', editedExpense.recurrenceType);
                if (editedExpense.recurrenceType === 'custom') {
                    formData.append('recurrenceCustomValue', editedExpense.recurrenceCustomValue);
                }
                if (editedExpense.recurrenceEndDate) {
                    formData.append('recurrenceEndDate', editedExpense.recurrenceEndDate);
                }
            }

            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            await onUpdate(expense.id, formData);
        } catch (err) {
            setError(err.message || 'Error al actualizar el gasto.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col border border-gray-300 overflow-hidden max-h-[90vh]">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Editar Gasto</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={(e) => e.preventDefault()} noValidate className="flex-grow overflow-y-auto p-6 space-y-4 bg-white no-scrollbar">
                    <DatePicker 
                        label="Fecha"
                        value={editedExpense.date}
                        onChange={(date) => handleSelectChange('date', date)}
                    />
                    <Select
                        label="Categoría"
                        value={editedExpense.category}
                        onChange={(value) => handleSelectChange('category', value)}
                        options={categoryOptions}
                        icon={faTag}
                    />
                    {editedExpense.category === 'Otros' && (
                        <InputField
                            label="Especificar Categoría"
                            name="customCategory"
                            value={editedExpense.customCategory}
                            onChange={handleChange}
                            placeholder="Ej: Impuestos, material..."
                        />
                    )}
                    <InputField label="Importe (€)" name="amount" type="number" value={editedExpense.amount} onChange={handleChange} icon={faEuroSign} />
                    <TextareaField label="Descripción (Opcional)" name="description" value={editedExpense.description} onChange={handleChange} placeholder="Detalles del gasto..." />

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                name="isRecurring"
                                id="isRecurringEdit"
                                checked={editedExpense.isRecurring}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <label
                                htmlFor="isRecurringEdit"
                                className="flex items-center cursor-pointer group"
                            >
                                <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${editedExpense.isRecurring ? 'bg-accent border-accent' : 'bg-white border-gray-300 group-hover:border-accent'}`}>
                                    <FontAwesomeIcon icon={faCheck} className={`h-3 w-3 text-white transition-opacity ${editedExpense.isRecurring ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                                <span className="ml-3 text-sm font-bold text-gray-700 uppercase select-none group-hover:text-accent transition-colors">
                                    Gasto Recurrente
                                </span>
                            </label>
                        </div>

                        {editedExpense.isRecurring && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <Select
                                    label="Frecuencia"
                                    value={editedExpense.recurrenceType}
                                    onChange={(value) => handleSelectChange('recurrenceType', value)}
                                    options={recurrenceOptions}
                                    icon={faSync}
                                />
                                {editedExpense.recurrenceType === 'custom' && (
                                    <InputField
                                        label="Intervalo (días)"
                                        name="recurrenceCustomValue"
                                        type="number"
                                        value={editedExpense.recurrenceCustomValue}
                                        onChange={handleChange}
                                        placeholder="Ej: 15"
                                    />
                                )}
                                <DatePicker
                                    label="Fecha de Finalización (opcional)"
                                    value={editedExpense.recurrenceEndDate}
                                    onChange={(date) => handleSelectChange('recurrenceEndDate', date)}
                                    placeholder="Sin fecha límite"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Adjuntar Nuevos Archivos</label>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,application/pdf"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-bold uppercase text-sm shadow-sm"
                        >
                            <FontAwesomeIcon icon={faPaperclip} className="text-accent" />
                            {attachments.length > 0 ? `${attachments.length} archivo(s) nuevo(s)` : 'Seleccionar archivos'}
                        </button>
                    </div>
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold uppercase rounded-r">
                            {error}
                        </div>
                    )}
                </form>

                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose} 
                        className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleUpdate} 
                        className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditExpenseModal;