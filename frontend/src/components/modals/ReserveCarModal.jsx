// autogest-app/frontend/src/components/modals/ReserveCarModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faClock, faUser, faIdCard, faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

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
    
    const [buyerData, setBuyerData] = useState({
        name: '',
        lastName: '',
        dni: '',
        phone: '',
        email: '',
        address: '',
    });

    const isValidDniNie = (value) => {
        const dniRegex = /^([0-9]{8}[A-Z])$/i;
        const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i;
        value = value.toUpperCase();
        if (!dniRegex.test(value) && !nieRegex.test(value)) return false;
        const controlChars = 'TRWAGMYFPDXBNJZSQVHLCKE';
        let number;
        if (nieRegex.test(value)) {
            const firstChar = value.charAt(0);
            let numPrefix;
            if (firstChar === 'X') numPrefix = '0';
            else if (firstChar === 'Y') numPrefix = '1';
            else if (firstChar === 'Z') numPrefix = '2';
            number = parseInt(numPrefix + value.substring(1, 8), 10);
        } else {
            number = parseInt(value.substring(0, 8), 10);
        }
        return controlChars.charAt(number % 23) === value.charAt(value.length - 1);
    };

    const parseNumber = (str) => {
        if (typeof str !== 'string' || !str) return '';
        return str.replace(/\./g, '').replace(',', '.');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBuyerData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirm = () => {
        setError('');
        const depositAmount = parseFloat(parseNumber(deposit));
        let durationValue = parseInt(duration, 10);

        if (!deposit || !buyerData.name.trim() || !buyerData.lastName.trim() || !buyerData.dni.trim() || !buyerData.phone.trim() || !buyerData.email.trim()) {
            setError("Los campos de reserva y los datos del comprador (excepto dirección) son obligatorios.");
            return;
        }
        if (isNaN(depositAmount) || depositAmount <= 0) {
            setError("El importe de la reserva debe ser un número válido y mayor que cero.");
            return;
        }
        if (isNaN(durationValue) || durationValue <= 0) {
            setError("La duración de la reserva debe ser un número válido y mayor que cero.");
            return;
        }
        if (!isValidDniNie(buyerData.dni)) {
            setError("El formato del DNI/NIE del comprador no es válido.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(buyerData.email)) {
            setError("Por favor, introduce un email válido para el comprador.");
            return;
        }

        const reservationDurationInHours = durationUnit === 'days' ? durationValue * 24 : durationValue;
        
        onConfirm(car, notes, depositAmount, reservationDurationInHours, buyerData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in-up">
            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* --- FIN DE LA MODIFICACIÓN --- */}
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary">RESERVAR COCHE</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4">
                        <div className="text-center mb-6">
                            <p className="text-text-secondary">VAS A RESERVAR EL <span className="font-bold text-text-primary">{car.make} {car.model} ({car.licensePlate})</span>.</p>
                        </div>

                        <h3 className="text-lg font-semibold text-text-primary border-b border-border-color pb-2">DATOS DE LA RESERVA</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div className="flex items-stretch gap-2">
                                    <div className="flex-1 min-w-[100px]">
                                        <InputField
                                            name="duration"
                                            type="number"
                                            inputMode="numeric"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            icon={faClock}
                                            required={true}
                                            label=""
                                        />
                                    </div>
                                    <div className="flex-shrink-0 flex items-center rounded-lg bg-background p-1 border border-border-color text-text-secondary">
                                        <button type="button" onClick={() => setDurationUnit('hours')} className={`px-3 py-1 text-sm rounded-md transition-colors ${durationUnit === 'hours' ? 'bg-accent text-white' : 'hover:bg-component-bg-hover'}`}>Horas</button>
                                        <button type="button" onClick={() => setDurationUnit('days')} className={`px-3 py-1 text-sm rounded-md transition-colors ${durationUnit === 'days' ? 'bg-accent text-white' : 'hover:bg-component-bg-hover'}`}>Días</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-text-primary border-b border-border-color pb-2 pt-4">DATOS DEL COMPRADOR</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="NOMBRE" name="name" value={buyerData.name} onChange={handleChange} icon={faUser} required={true} />
                            <InputField label="APELLIDOS" name="lastName" value={buyerData.lastName} onChange={handleChange} required={true} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="DNI/NIE" name="dni" value={buyerData.dni} onChange={handleChange} icon={faIdCard} required={true} />
                            <InputField label="TELÉFONO" name="phone" value={buyerData.phone} onChange={handleChange} icon={faPhone} required={true} />
                        </div>
                        <InputField label="CORREO ELECTRÓNICO" name="email" value={buyerData.email} onChange={handleChange} type="email" icon={faEnvelope} required={true} />
                        <InputField label="DIRECCIÓN (OPCIONAL)" name="address" value={buyerData.address} onChange={handleChange} icon={faMapMarkerAlt} />
                        
                        <TextareaField
                            label="Anotaciones de la reserva (Opcional)"
                            name="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Señal recibida. Cliente: Juan Pérez."
                        />
                        {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                    </form>
                </div>
                
                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-border-color">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">CANCELAR</button>
                    <button onClick={handleConfirm} className="bg-accent text-white px-4 py-2 rounded-lg shadow-sm hover:bg-accent-hover transition-colors">CONFIRMAR RESERVA</button>
                </div>
            </div>
        </div>
    );
};

export default ReserveCarModal;