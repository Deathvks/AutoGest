import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign } from '@fortawesome/free-solid-svg-icons';

// --- Componentes de Formulario ---
const InputField = ({ label, name, value, onChange, type = 'text', icon }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-slate-400" />
                </div>
            )}
            <input 
                type={type} 
                name={name} 
                value={value} 
                onChange={onChange} 
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500 ${icon ? 'pl-9' : ''}`} 
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
            <textarea ref={textareaRef} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500 resize-none overflow-hidden" rows="3" />
        </div>
    );
};

// --- Componente Principal del Modal ---
const ReserveCarModal = ({ car, onClose, onConfirm }) => {
    const [notes, setNotes] = useState(car.notes || '');
    const [deposit, setDeposit] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        setError('');
        const depositAmount = parseFloat(deposit);

        if (deposit && (isNaN(depositAmount) || depositAmount <= 0)) {
            setError("El importe de la reserva debe ser un número válido y mayor que cero.");
            return;
        }
        
        onConfirm(car, notes, depositAmount || null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Reservar Coche</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="text-left mb-6">
                        <p className="text-slate-600 dark:text-slate-400">
                            Vas a marcar como reservado el <span className="font-bold text-slate-800 dark:text-slate-200">{car.make} {car.model}</span>.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <InputField
                            label="Importe de Reserva (€) (Opcional)"
                            name="deposit"
                            type="number"
                            value={deposit}
                            onChange={(e) => setDeposit(e.target.value)}
                            icon={faEuroSign}
                        />
                        <TextareaField
                            label="Anotaciones de la reserva (Opcional)"
                            name="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Señal recibida. Cliente: Juan Pérez."
                        />
                    </div>
                    {error && <p className="mt-4 text-sm text-rose-600 text-center">{error}</p>}
                </form>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-amber-600 transition-colors">Confirmar Reserva</button>
                </div>
            </div>
        </div>
    );
};

export default ReserveCarModal;