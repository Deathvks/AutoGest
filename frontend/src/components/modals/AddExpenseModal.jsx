// autogest-app/frontend/src/components/modals/AddExpenseModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faCalendarDays, faTag, faPaperclip, faSync, faCheck } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';
// --- INICIO DE LA MODIFICACIÓN ---
import DatePicker from '../DatePicker'; // Importamos el nuevo componente
// --- FIN DE LA MODIFICACIÓN ---

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
                className={`w-full px-4 py-2 bg-component-bg-hover border rounded-lg focus:ring-1 focus:border-accent text-text-primary transition-colors border-border-color focus:ring-accent ${icon ? 'pl-11' : ''} min-w-0 text-left`}
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

const AddExpenseModal = ({ car, onClose, onAdd }) => {
    // --- INICIO DE LA MODIFICACIÓN ---
    const today = new Date().toISOString().split('T')[0];
    const [newExpense, setNewExpense] = useState({
        date: today,
    // --- FIN DE LA MODIFICACIÓN ---
        category: 'Mecánica',
        customCategory: '',
        amount: '',
        description: '',
        carLicensePlate: car ? car.licensePlate : null,
        isRecurring: false,
        recurrenceType: 'monthly',
        recurrenceCustomValue: '',
        recurrenceEndDate: '',
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setNewExpense(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSelectChange = (name, value) => {
        setNewExpense(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setAttachments([...e.target.files]);
    };

    const validateForm = () => {
        if (!newExpense.date || !newExpense.category || !newExpense.amount) {
            setError("Los campos de fecha, categoría e importe son obligatorios.");
            return false;
        }
        if (newExpense.category === 'Otros' && !newExpense.customCategory.trim()) {
            setError("Debes especificar la categoría personalizada.");
            return false;
        }
        if (isNaN(parseFloat(newExpense.amount)) || parseFloat(newExpense.amount) <= 0) {
            setError("El importe debe ser un número válido y mayor que cero.");
            return false;
        }
        if (newExpense.isRecurring) {
            if (!newExpense.recurrenceType) {
                setError("Debes seleccionar un tipo de recurrencia.");
                return false;
            }
            if (newExpense.recurrenceType === 'custom' && (!newExpense.recurrenceCustomValue || parseInt(newExpense.recurrenceCustomValue) <= 0)) {
                setError("El intervalo personalizado debe ser un número mayor que cero.");
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleAdd = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            const formData = new FormData();
            const finalCategory = newExpense.category === 'Otros' ? newExpense.customCategory.trim() : newExpense.category;

            formData.append('date', newExpense.date);
            formData.append('category', finalCategory);
            formData.append('amount', newExpense.amount);
            formData.append('description', newExpense.description);
            if (newExpense.carLicensePlate) {
                formData.append('carLicensePlate', newExpense.carLicensePlate);
            }

            formData.append('isRecurring', newExpense.isRecurring);
            if (newExpense.isRecurring) {
                formData.append('recurrenceType', newExpense.recurrenceType);
                if (newExpense.recurrenceType === 'custom') {
                    formData.append('recurrenceCustomValue', newExpense.recurrenceCustomValue);
                }
                if (newExpense.recurrenceEndDate) {
                    formData.append('recurrenceEndDate', newExpense.recurrenceEndDate);
                }
            }

            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            await onAdd(formData);
        } catch (err) {
            setError(err.message || 'Ha ocurrido un error inesperado.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border-color flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-xl font-bold text-text-primary">Añadir Nuevo Gasto</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4 overflow-y-auto no-scrollbar flex-grow overflow-x-hidden">
                    {car && (
                        <div className="p-3 bg-component-bg-hover rounded-lg text-center border border-border-color">
                            <p className="text-sm text-text-secondary">
                                Gasto para: <span className="font-bold text-text-primary">{car.make} {car.model} ({car.licensePlate})</span>
                            </p>
                        </div>
                    )}

                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <DatePicker 
                        label="Fecha"
                        value={newExpense.date}
                        onChange={(date) => handleSelectChange('date', date)}
                    />
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                    <Select
                        label="Categoría"
                        value={newExpense.category}
                        onChange={(value) => handleSelectChange('category', value)}
                        options={categoryOptions}
                        icon={faTag}
                    />
                    {newExpense.category === 'Otros' && (
                        <InputField
                            label="Especificar Categoría"
                            name="customCategory"
                            value={newExpense.customCategory}
                            onChange={handleChange}
                            placeholder="Ej: Impuestos, material..."
                        />
                    )}
                    <InputField label="Importe (€)" name="amount" type="number" value={newExpense.amount} onChange={handleChange} icon={faEuroSign} />
                    <TextareaField label="Descripción (Opcional)" name="description" value={newExpense.description} onChange={handleChange} placeholder="Detalles del gasto..." />

                    <div className="space-y-4 pt-4 border-t border-border-color">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isRecurring"
                                id="isRecurring"
                                checked={newExpense.isRecurring}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <label
                                htmlFor="isRecurring"
                                className="flex items-center cursor-pointer"
                            >
                                <div className="w-5 h-5 bg-component-bg-hover border-2 border-border-color rounded-md flex items-center justify-center transition-colors peer-checked:bg-accent peer-checked:border-accent peer-focus:ring-2 peer-focus:ring-accent peer-focus:ring-offset-2 peer-focus:ring-offset-component-bg">
                                    <FontAwesomeIcon icon={faCheck} className={`h-3 w-3 text-white transition-opacity ${newExpense.isRecurring ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                                <span className="ml-3 text-sm font-semibold text-text-primary select-none">
                                    Gasto Recurrente
                                </span>
                            </label>
                        </div>

                        {newExpense.isRecurring && (
                            <div className="space-y-4 p-4 bg-background/50 rounded-xl border border-border-color">
                                <Select
                                    label="Frecuencia"
                                    value={newExpense.recurrenceType}
                                    onChange={(value) => handleSelectChange('recurrenceType', value)}
                                    options={recurrenceOptions}
                                    icon={faSync}
                                />
                                {newExpense.recurrenceType === 'custom' && (
                                    <InputField
                                        label="Intervalo (días)"
                                        name="recurrenceCustomValue"
                                        type="number"
                                        value={newExpense.recurrenceCustomValue}
                                        onChange={handleChange}
                                        placeholder="Ej: 15"
                                    />
                                )}
                                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                                <DatePicker
                                    label="Fecha de Finalización (opcional)"
                                    value={newExpense.recurrenceEndDate}
                                    onChange={(date) => handleSelectChange('recurrenceEndDate', date)}
                                    placeholder="Sin fecha límite"
                                />
                                {/* --- FIN DE LA MODIFICACIÓN --- */}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1">Adjuntar Archivos</label>
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
                            {attachments.length > 0 ? `${attachments.length} archivo(s) seleccionado(s)` : 'Seleccionar archivos'}
                        </button>
                    </div>

                    {error && <p className="mt-2 text-sm text-red-accent text-center font-semibold uppercase">{error}</p>}
                </form>
                <div className="mt-6 flex justify-end gap-4 pt-6 border-t border-border-color flex-shrink-0">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold">Cancelar</button>
                    <button onClick={handleAdd} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold">Añadir Gasto</button>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;