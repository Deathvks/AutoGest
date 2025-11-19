// frontend/src/components/DatePicker.jsx
import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import 'react-day-picker/style.css';

const DatePicker = ({ label, value, onChange, placeholder = 'DD/MM/AAAA', icon = faCalendarDays }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // value se espera en formato 'YYYY-MM-DD'
    const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

    const handleDayClick = (date) => {
        if (date) {
            onChange(format(date, 'yyyy-MM-dd'));
        }
        setIsModalOpen(false); // Cierra el modal al seleccionar
    };

    // Formateamos el valor para mostrarlo en el botón
    const displayValue = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '';

    return (
        <div className="relative">
            {label && <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">{label}</label>}
            
            {/* Botón que abre el modal */}
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="relative w-full cursor-pointer rounded-lg bg-white py-2.5 px-4 pr-10 text-left border border-gray-300 h-[42px] flex items-center transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            >
                {icon && (
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" aria-hidden="true" />
                )}
                <span 
                    className={`block truncate text-sm ${icon ? 'ml-3' : ''} ${
                        displayValue ? 'text-gray-900 font-medium' : 'text-gray-400'
                    }`}
                >
                    {displayValue || placeholder}
                </span>
            </button>
            
            {/* Modal del Calendario */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-gray-300 p-4"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDayClick} 
                            locale={es}
                            defaultMonth={selectedDate || new Date()}
                            captionLayout="buttons"
                            fromYear={1990}
                            toYear={new Date().getFullYear() + 1}
                            weekStartsOn={1} // Lunes como primer día
                            modifiersClassNames={{
                                selected: 'bg-accent text-white hover:bg-accent-hover', // Estilo Occident para selección
                                today: 'text-accent font-bold'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;