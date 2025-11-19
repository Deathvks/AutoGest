// autogest-app/frontend/src/components/modals/ReserveCarModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faClock, faUser, faIdCard, faPhone, faEnvelope, faMapMarkerAlt, faBuilding, faRoad, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

const InputField = ({ label, name, value, onChange, type = 'text', icon, inputMode, required = false, placeholder = '', className = '' }) => (
    <div>
        {label && (
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </label>
        )}
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                inputMode={inputMode}
                className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors ${icon ? 'pl-11' : ''} ${className}`}
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

const DurationToggle = ({ selectedUnit, onSelect }) => (
    <div className="relative flex w-full h-full items-center rounded-lg bg-gray-100 border border-gray-200 overflow-hidden p-1">
        <div className="relative flex w-full h-full">
            <div
                className={`absolute top-0 bottom-0 w-1/2 rounded bg-white shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out ${
                    selectedUnit === 'days' ? 'translate-x-full' : 'translate-x-0'
                }`}
            />
            <button
                type="button"
                onClick={() => onSelect('hours')}
                className={`relative z-10 flex-1 text-xs font-bold transition-colors duration-300 uppercase flex items-center justify-center ${
                    selectedUnit === 'hours' ? 'text-accent' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                Horas
            </button>
            <button
                type="button"
                onClick={() => onSelect('days')}
                className={`relative z-10 flex-1 text-xs font-bold transition-colors duration-300 uppercase flex items-center justify-center ${
                    selectedUnit === 'days' ? 'text-accent' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                Días
            </button>
        </div>
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
        streetAddress: '',
        postalCode: '',
        city: '',
        province: '',
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
            setError("Los campos de reserva y los datos básicos del comprador (nombre, apellidos, DNI/NIE, teléfono, email) son obligatorios.");
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-300 overflow-hidden">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faCalendarCheck} className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Reservar Coche</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 no-scrollbar bg-white">
                    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
                        <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-600 text-sm uppercase font-medium">
                                Estás reservando el <span className="font-bold text-gray-900">{car.make} {car.model} ({car.licensePlate})</span>.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b border-gray-100 pb-1">Datos de la Reserva</h3>
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
                                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
                                        Duración
                                        <span className="text-red-600 ml-1">*</span>
                                    </label>
                                    <div className="flex items-stretch gap-2 h-[42px]"> {/* Fixed height to match inputs */}
                                        <div className="relative flex-grow w-3/5">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input 
                                                type="text" 
                                                inputMode="numeric" 
                                                value={duration} 
                                                onChange={(e) => setDuration(e.target.value)} 
                                                className="w-full h-full pl-11 pr-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 transition-colors" 
                                            />
                                        </div>
                                        <div className="w-2/5 flex-shrink-0 h-full">
                                            <DurationToggle selectedUnit={durationUnit} onSelect={setDurationUnit} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b border-gray-100 pb-1">Datos del Comprador</h3>
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
                                
                                <InputField label="Dirección (Calle, Número, Piso)" name="streetAddress" value={buyerData.streetAddress} onChange={handleChange} icon={faMapMarkerAlt} required={false} />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <InputField label="Código Postal" name="postalCode" value={buyerData.postalCode} onChange={handleChange} icon={faMapMarkerAlt} required={false} />
                                    <InputField label="Ciudad" name="city" value={buyerData.city} onChange={handleChange} icon={faBuilding} required={false} />
                                    <InputField label="Provincia" name="province" value={buyerData.province} onChange={handleChange} icon={faRoad} required={false} />
                                </div>
                            </div>
                        </div>

                        <TextareaField
                            label="Anotaciones (Opcional)"
                            name="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Señal recibida. Cliente: Juan Pérez."
                        />
                        {error && (
                            <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold uppercase rounded-r">
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose} 
                        className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Confirmar Reserva
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReserveCarModal;