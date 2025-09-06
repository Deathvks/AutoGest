// autogest-app/frontend/src/components/modals/AddExpenseModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faCalendarDays, faTag, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import Select from '../Select';

// --- Componentes de Formulario ---
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
const AddExpenseModal = ({ car, onClose, onAdd }) => {
    const today = new Date().toISOString().split('T')[0];
    const [newExpense, setNewExpense] = useState({
        date: today,
        category: 'Mecánica',
        customCategory: '', // <-- NUEVO CAMPO PARA LA CATEGORÍA PERSONALIZADA
        amount: '',
        description: '',
        carLicensePlate: car ? car.licensePlate : null
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewExpense(prev => ({ ...prev, [name]: value }));
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
        // --- NUEVA VALIDACIÓN ---
        if (newExpense.category === 'Otros' && !newExpense.customCategory.trim()) {
            setError("Debes especificar la categoría personalizada.");
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
            const formData = new FormData();
            
            // --- LÓGICA MODIFICADA PARA ENVIAR LA CATEGORÍA CORRECTA ---
            const finalCategory = newExpense.category === 'Otros' ? newExpense.customCategory.trim() : newExpense.category;

            // Añadimos los datos del gasto al FormData
            formData.append('date', newExpense.date);
            formData.append('category', finalCategory);
            formData.append('amount', newExpense.amount);
            formData.append('description', newExpense.description);
            if (newExpense.carLicensePlate) {
                formData.append('carLicensePlate', newExpense.carLicensePlate);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">Añadir Nuevo Gasto</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    {car && (
                        <div className="mb-4 p-3 bg-background rounded-lg text-center">
                            <p className="text-sm text-text-secondary">
                                Gasto para: <span className="font-bold text-text-primary">{car.make} {car.model} ({car.licensePlate})</span>
                            </p>
                        </div>
                    )}
                    <div className="space-y-4">
                        <InputField label="Fecha" name="date" type="date" value={newExpense.date} onChange={handleChange} icon={faCalendarDays} />
                        <Select
                            label="Categoría"
                            value={newExpense.category}
                            onChange={(value) => handleSelectChange('category', value)}
                            options={categoryOptions}
                        />
                        {/* --- CAMPO CONDICIONAL --- */}
                        {newExpense.category === 'Otros' && (
                            <InputField 
                                label="Especificar Categoría" 
                                name="customCategory" 
                                value={newExpense.customCategory} 
                                onChange={handleChange}
                                placeholder="Ej: Impuestos, material de oficina..." 
                            />
                        )}
                        <InputField label="Importe (€)" name="amount" type="number" value={newExpense.amount} onChange={handleChange} icon={faEuroSign} />
                        <TextareaField label="Descripción (Opcional)" name="description" value={newExpense.description} onChange={handleChange} placeholder="Detalles del gasto..." />
                        
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Adjuntar Archivos</label>
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
                                className="w-full bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors flex items-center justify-center gap-2 border border-border-color"
                            >
                                <FontAwesomeIcon icon={faPaperclip} />
                                {attachments.length > 0 ? `${attachments.length} archivo(s) seleccionado(s)` : 'Seleccionar archivos'}
                            </button>
                        </div>
                    </div>
                    {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                </form>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleAdd} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Añadir Gasto</button>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;