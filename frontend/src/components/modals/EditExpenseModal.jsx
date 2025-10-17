// autogest-app/frontend/src/components/modals/EditExpenseModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faCalendarDays, faTag, faPaperclip, faSync, faCheck } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';

const InputField = ({ label, name, value, onChange, type = 'text', icon, placeholder }) => (
    <div>
        <label className="block text-sm font-semibold text-text-primary mb-1">{label}</label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
                </div>
            )}
            <input
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                className={`w-full px-4 py-2 bg-component-bg-hover border rounded-lg focus:ring-1 focus:border-accent text-text-primary transition-colors border-border-color focus:ring-accent ${icon ? 'pl-11' : ''}`}
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
            <label className="block text-sm font-semibold text-text-primary mb-1">{label}</label>
            <textarea ref={textareaRef} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-4 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent focus:border-accent text-text-primary resize-none overflow-hidden" rows="3" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border-color flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">Editar Gasto</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4">
                    <InputField label="Fecha" name="date" type="date" value={editedExpense.date} onChange={handleChange} icon={faCalendarDays} />
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

                    <div className="space-y-4 pt-4 border-t border-border-color">
                        <div className="flex items-center">
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
                                className="flex items-center cursor-pointer"
                            >
                                <div className="w-5 h-5 bg-component-bg-hover border-2 border-border-color rounded-md flex items-center justify-center transition-colors peer-checked:bg-accent peer-checked:border-accent peer-focus:ring-2 peer-focus:ring-accent peer-focus:ring-offset-2 peer-focus:ring-offset-component-bg">
                                    <FontAwesomeIcon icon={faCheck} className={`h-3 w-3 text-white transition-opacity ${editedExpense.isRecurring ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                                <span className="ml-3 text-sm font-semibold text-text-primary select-none">
                                    Gasto Recurrente
                                </span>
                            </label>
                        </div>

                        {editedExpense.isRecurring && (
                            <div className="space-y-4 p-4 bg-background/50 rounded-xl border border-border-color">
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
                                <InputField
                                    label="Fecha de Finalización (opcional)"
                                    name="recurrenceEndDate"
                                    type="date"
                                    value={editedExpense.recurrenceEndDate}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1">Adjuntar Nuevos Archivos</label>
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
                            className="w-full bg-component-bg-hover text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors flex items-center justify-center gap-2 border border-border-color font-semibold"
                        >
                            <FontAwesomeIcon icon={faPaperclip} />
                            {attachments.length > 0 ? `${attachments.length} archivo(s) nuevo(s)` : 'Seleccionar archivos'}
                        </button>
                    </div>
                    {error && <p className="mt-2 text-sm text-red-accent text-center font-semibold uppercase">{error}</p>}
                </form>
                <div className="mt-6 flex justify-end gap-4 pt-6 border-t border-border-color">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold">Cancelar</button>
                    <button onClick={handleUpdate} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default EditExpenseModal;