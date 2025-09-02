// autogest-app/frontend/src/components/modals/EditExpenseModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faCalendarDays, faTag, faCar } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';

// --- Componentes de Formulario (Reutilizados) ---
const InputField = ({ label, name, value, onChange, type = 'text', icon, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
                </div>
            )}
            <input 
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                className={`w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary ${icon ? 'pl-9' : ''}`} 
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
            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
            <textarea ref={textareaRef} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary resize-none overflow-hidden" rows="3" />
        </div>
    );
};

// --- Componente Principal del Modal ---
const EditExpenseModal = ({ expense, cars, onClose, onUpdate }) => {
    const [editedExpense, setEditedExpense] = useState({
        date: '',
        category: '',
        amount: '',
        description: '',
        carLicensePlate: ''
    });
    const [otherCategory, setOtherCategory] = useState('');
    const [error, setError] = useState('');

    const categoryOptions = [
        { id: 'Mecánica', name: 'Mecánica' },
        { id: 'Limpieza', name: 'Limpieza' },
        { id: 'Gestoría', name: 'Gestoría' },
        { id: 'Combustible', name: 'Combustible' },
        { id: 'Otros', name: 'Otros' },
    ];

    useEffect(() => {
        if (expense) {
            const isCustomCategory = !categoryOptions.some(opt => opt.id === expense.category);
            
            setEditedExpense({
                date: new Date(expense.date).toISOString().split('T')[0],
                category: isCustomCategory ? 'Otros' : expense.category,
                amount: expense.amount,
                description: expense.description || '',
                carLicensePlate: expense.carLicensePlate
            });

            if (isCustomCategory) {
                setOtherCategory(expense.category);
            } else {
                setOtherCategory('');
            }
        }
    }, [expense]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedExpense(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSelectChange = (name, value) => {
        setEditedExpense(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!editedExpense.date || !editedExpense.category || !editedExpense.amount || !editedExpense.carLicensePlate) {
            setError("Todos los campos, incluida la matrícula, son obligatorios.");
            return false;
        }
        if (editedExpense.category === 'Otros' && !otherCategory.trim()) {
            setError("Debes especificar la categoría si seleccionas 'Otros'.");
            return false;
        }
        if (isNaN(parseFloat(editedExpense.amount)) || parseFloat(editedExpense.amount) <= 0) {
            setError("El importe debe ser un número válido y mayor que cero.");
            return false;
        }
        setError('');
        return true;
    };

    const handleUpdate = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            const finalExpenseData = {
                ...editedExpense,
                category: editedExpense.category === 'Otros' ? otherCategory.trim() : editedExpense.category,
            };
            await onUpdate(expense.id, finalExpenseData);
        } catch (err) {
            setError(err.message || 'Ha ocurrido un error inesperado al actualizar.');
        }
    };

    if (!expense) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">Editar Gasto</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="space-y-4">
                        <InputField label="Fecha" name="date" type="date" value={editedExpense.date} onChange={handleChange} icon={faCalendarDays} />
                        <Select
                            label="Categoría"
                            value={editedExpense.category}
                            onChange={(value) => handleSelectChange('category', value)}
                            options={categoryOptions}
                        />
                        {editedExpense.category === 'Otros' && (
                            <InputField 
                                label="Especificar Categoría"
                                name="otherCategory"
                                value={otherCategory}
                                onChange={(e) => setOtherCategory(e.target.value)}
                                placeholder="Ej: Impuestos"
                                icon={faTag}
                            />
                        )}
                        <InputField label="Importe (€)" name="amount" type="number" value={editedExpense.amount} onChange={handleChange} icon={faEuroSign} />
                        <InputField 
                            label="Asociar a Coche (Matrícula)" 
                            name="carLicensePlate" 
                            value={editedExpense.carLicensePlate} 
                            onChange={handleChange} 
                            icon={faCar}
                            placeholder="Escribe la matrícula"
                        />
                        <TextareaField label="Descripción" name="description" value={editedExpense.description} onChange={handleChange} placeholder="Detalles del gasto..." />
                    </div>
                    {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                </form>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleUpdate} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default EditExpenseModal;