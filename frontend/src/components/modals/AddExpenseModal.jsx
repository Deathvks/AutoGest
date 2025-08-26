// autogest-app/frontend/src/components/modals/AddExpenseModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faCalendarDays, faTag, faCar } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';

// --- Componentes de Formulario ---
const InputField = ({ label, name, value, onChange, type = 'text', icon, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-slate-400" />
                </div>
            )}
            <input 
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${icon ? 'pl-9' : ''}`} 
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
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
            <textarea ref={textareaRef} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden" rows="3" />
        </div>
    );
};

// --- Componente Principal del Modal ---
const AddExpenseModal = ({ cars, onClose, onAdd }) => {
    const today = new Date().toISOString().split('T')[0];
    const [newExpense, setNewExpense] = useState({
        date: today,
        category: 'Mecánica',
        amount: '',
        description: '',
        carLicensePlate: ''
    });
    const [error, setError] = useState('');

    const categoryOptions = [
        { id: 'Mecánica', name: 'Mecánica' },
        { id: 'Limpieza', name: 'Limpieza' },
        { id: 'Gestoría', name: 'Gestoría' },
        { id: 'Combustible', name: 'Combustible' },
        { id: 'Otros', name: 'Otros' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewExpense(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSelectChange = (name, value) => {
        setNewExpense(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!newExpense.date || !newExpense.category || !newExpense.amount || !newExpense.carLicensePlate) {
            setError("Todos los campos, incluida la matrícula, son obligatorios.");
            return false;
        }
        if (isNaN(parseFloat(newExpense.amount)) || parseFloat(newExpense.amount) <= 0) {
            setError("El importe debe ser un número válido y mayor que cero.");
            return false;
        }
        setError('');
        return true;
    };

    const handleAdd = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            await onAdd(newExpense);
        } catch (err) {
            setError(err.message || 'Ha ocurrido un error inesperado.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Añadir Nuevo Gasto</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="space-y-4">
                        <InputField label="Fecha" name="date" type="date" value={newExpense.date} onChange={handleChange} icon={faCalendarDays} />
                        <Select
                            label="Categoría"
                            value={newExpense.category}
                            onChange={(value) => handleSelectChange('category', value)}
                            options={categoryOptions}
                            icon={faTag}
                        />
                        <InputField label="Importe (€)" name="amount" type="number" value={newExpense.amount} onChange={handleChange} icon={faEuroSign} />
                        <InputField 
                            label="Asociar a Coche (Matrícula)" 
                            name="carLicensePlate" 
                            value={newExpense.carLicensePlate} 
                            onChange={handleChange} 
                            icon={faCar}
                            placeholder="Escribe la matrícula"
                        />
                        <TextareaField label="Descripción" name="description" value={newExpense.description} onChange={handleChange} placeholder="Detalles del gasto..." />
                    </div>
                    {error && <p className="mt-4 text-sm text-rose-600 text-center">{error}</p>}
                </form>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                    <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Añadir Gasto</button>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;