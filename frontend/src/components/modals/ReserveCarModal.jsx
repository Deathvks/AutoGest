// autogest-app/frontend/src/components/modals/ReserveCarModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faClock, faUser, faIdCard, faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, required = false, placeholder = '', className = '' }) => (
    <div>
        {label && (
            <label className="block text-sm font-semibold text-text-primary mb-1">
                {label}
                {required && <span className="text-red-accent ml-1">*</span>}
            </label>
        )}
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
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
                className={`w-full px-4 py-2 bg-component-bg-hover border rounded-lg focus:ring-1 focus:border-accent text-text-primary transition-colors border-border-color focus:ring-accent placeholder:text-text-secondary/70 ${icon ? 'pl-11' : ''} ${className}`}
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
            <textarea ref={textareaRef} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-4 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-secondary/70 resize-none overflow-hidden" rows="3" />
        </div>
    );
};

const DurationToggle = ({ selectedUnit, onSelect }) => (
    <div className="relative flex w-full h-full items-center rounded-full bg-component-bg-hover border border-border-color overflow-hidden">
        <span
            className={`absolute top-0 left-0 h-full w-1/2 rounded-full bg-component-bg backdrop-blur-sm shadow-lg transition-transform duration-300 ${
                selectedUnit === 'days' ? 'translate-x-full' : 'translate-x-0'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
        <button
            type="button"
            onClick={() => onSelect('hours')}
            className={`relative z-10 flex-1 rounded-full py-2 text-xs font-bold transition-colors duration-300 ${
                selectedUnit === 'hours' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
        >
            Horas
        </button>
        <button
            type="button"
            onClick={() => onSelect('days')}
            className={`relative z-10 flex-1 rounded-full py-2 text-xs font-bold transition-colors duration-300 ${
                selectedUnit === 'days' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
        >
            Días
        </button>
    </div>
);

const ReserveCarModal = ({ car, onClose, onConfirm }) => {
    const [notes, setNotes] = useState('');
    const [deposit, setDeposit] = useState('');
    const [duration, setDuration] = useState('24');
    const [durationUnit, setDurationUnit] = useState('hours');
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border-color">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary uppercase">Reservar Coche</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
                    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
                        <div className="text-center">
                            <p className="text-text-secondary uppercase">Estás reservando el <span className="font-bold text-text-primary">{car.make} {car.model} ({car.licensePlate})</span>.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-text-primary mb-3">Datos de la Reserva</h3>
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
                                    <label className="block text-sm font-semibold text-text-primary mb-1">
                                        Duración
                                        <span className="text-red-accent ml-1">*</span>
                                    </label>
                                    <div className="flex items-stretch gap-2">
                                        <div className="relative flex-grow w-3/5">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-text-secondary" />
                                            </div>
                                            <input type="text" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full h-full pl-11 pr-3 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent" />
                                        </div>
                                        <div className="w-2/5 flex-shrink-0 h-full">
                                            <DurationToggle selectedUnit={durationUnit} onSelect={setDurationUnit} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-text-primary mb-3 pt-4 border-t border-border-color">Datos del Comprador</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Nombre" name="name" value={buyerData.name} onChange={handleChange} required={true} icon={faUser} />
                                    <InputField label="Apellidos" name="lastName" value={buyerData.lastName} onChange={handleChange} required={true} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="DNI/NIE" name="dni" value={buyerData.dni} onChange={handleChange} required={true} icon={faIdCard} />
                                    <InputField label="Teléfono" name="phone" value={buyerData.phone} onChange={handleChange} required={true} icon={faPhone} />
                                </div>
                                <InputField label="Correo Electrónico" name="email" value={buyerData.email} onChange={handleChange} type="email" required={true} icon={faEnvelope} />
                                <InputField label="Dirección (Opcional)" name="address" value={buyerData.address} onChange={handleChange} icon={faMapMarkerAlt} required={false} />
                            </div>
                        </div>
                        
                        <TextareaField
                            label="Anotaciones (Opcional)"
                            name="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Señal recibida. Cliente: Juan Pérez."
                        />
                        {error && <p className="text-sm text-red-accent text-center font-semibold uppercase">{error}</p>}
                    </form>
                </div>
                
                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-border-color">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold">CANCELAR</button>
                    <button onClick={handleConfirm} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold">CONFIRMAR RESERVA</button>
                </div>
            </div>
        </div>
    );
};

export default ReserveCarModal;