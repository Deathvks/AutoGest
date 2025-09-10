// autogest-app/frontend/src/components/modals/ReserveCarModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faClock } from '@fortawesome/free-solid-svg-icons';

// --- Componentes de Formulario ---
const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, required = false, placeholder = '', className = '' }) => (
    <div>
        {label && (
            <label className="block text-sm font-medium text-text-secondary mb-1">
                {label}
                {required && <span className="text-red-accent ml-1">*</span>}
            </label>
        )}
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                inputMode={inputMode}
                className={`w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-accent focus:border-accent text-text-primary ${icon ? 'pl-9' : ''} ${className}`}
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
            <textarea ref={textareaRef} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-accent focus:border-accent text-text-primary resize-none overflow-hidden" rows="3" />
        </div>
    );
};

// --- Componente Principal del Modal ---
const ReserveCarModal = ({ car, onClose, onConfirm }) => {
    const [notes, setNotes] = useState('');
    const [deposit, setDeposit] = useState('');
    const [duration, setDuration] = useState('24');
    const [durationUnit, setDurationUnit] = useState('hours'); // 'hours' or 'days'
    const [error, setError] = useState('');

    const parseNumber = (str) => {
        if (typeof str !== 'string' || !str) return '';
        return str.replace(/\./g, '').replace(',', '.');
    };

    const handleConfirm = () => {
        setError('');
        const depositAmount = parseFloat(parseNumber(deposit));
        let durationValue = parseInt(duration, 10);

        if (!deposit) {
            setError("El importe de la reserva es obligatorio.");
            return;
        }
        if (isNaN(depositAmount) || depositAmount <= 0) {
            setError("El importe debe ser un número válido y mayor que cero.");
            return;
        }
        if (isNaN(durationValue) || durationValue <= 0) {
            setError("La duración de la reserva debe ser un número válido y mayor que cero.");
            return;
        }

        // Convertir a horas si la unidad es 'días'
        const reservationDurationInHours = durationUnit === 'days' ? durationValue * 24 : durationValue;

        onConfirm(car, notes, depositAmount, reservationDurationInHours);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-sm md:max-w-md lg:max-w-lg p-6 border border-border-color"> {/* Ajuste max-w */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Reservar Coche</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="text-left mb-6">
                        <p className="text-text-secondary">
                            Vas a marcar como reservado el <span className="font-bold text-text-primary">{car.make} {car.model} ({car.licensePlate})</span>.
                        </p>
                        <p className="text-sm text-text-secondary mt-1">
                            Precio de compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                        </p>
                        <p className="text-sm text-text-secondary">
                            Precio de venta: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <InputField
                            label="Importe de Reserva (€)"
                            name="deposit"
                            type="text"
                            inputMode="decimal"
                            value={deposit}
                            onChange={(e) => setDeposit(e.target.value)}
                            icon={faEuroSign}
                            required={true}
                        />
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Duración de la Reserva
                                <span className="text-red-accent ml-1">*</span>
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"> {/* Ajuste para responsive */}
                                <InputField
                                    name="duration"
                                    type="number"
                                    inputMode="numeric"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    icon={faClock}
                                    required={true}
                                    className="flex-grow" // Ocupa el espacio disponible
                                    label="" // No repetir la etiqueta
                                />
                                <div className="flex flex-grow sm:flex-grow-0 items-center rounded-lg bg-background p-1 border border-border-color text-text-secondary"> {/* Ajuste de tamaño del div */}
                                    <button type="button" onClick={() => setDurationUnit('hours')} className={`flex-1 sm:flex-none px-3 py-1 text-sm rounded-md transition-colors ${durationUnit === 'hours' ? 'bg-accent text-white' : 'hover:bg-component-bg-hover'}`}>Horas</button>
                                    <button type="button" onClick={() => setDurationUnit('days')} className={`flex-1 sm:flex-none px-3 py-1 text-sm rounded-md transition-colors ${durationUnit === 'days' ? 'bg-accent text-white' : 'hover:bg-component-bg-hover'}`}>Días</button>
                                </div>
                            </div>
                        </div>
                        <TextareaField
                            label="Anotaciones de la reserva (Opcional)"
                            name="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Señal recibida. Cliente: Juan Pérez."
                        />
                    </div>
                    {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                </form>
                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3"> {/* Ajuste para responsive */}
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors order-2 sm:order-1">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-accent text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent-hover transition-colors order-1 sm:order-2">Confirmar Reserva</button>
                </div>
            </div>
        </div>
    );
};

export default ReserveCarModal;