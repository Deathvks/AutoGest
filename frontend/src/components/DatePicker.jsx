// frontend/src/components/DatePicker.jsx
import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import 'react-day-picker/style.css'; 

// --- INICIO DE LA MODIFICACIÓN ---
// Formateador para capitalizar el mes en el título
const formatCaption = (date, options) => {
    const monthYear = format(date, 'MMMM yyyy', { locale: options?.locale });
    // Capitaliza solo la primera letra del string completo (ej: "Diciembre 2025")
    return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
};
// --- FIN DE LA MODIFICACIÓN ---

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
            {label && <label className="block text-sm font-semibold text-text-primary mb-1 uppercase">{label}</label>}
            
            {/* Botón que abre el modal */}
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="relative w-full cursor-pointer rounded-lg bg-component-bg-hover py-2 px-4 pr-10 text-left border-none h-[42px] flex items-center transition-colors border border-border-color focus:ring-1 focus:ring-accent focus:border-accent"
            >
                {icon && (
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                )}
                <span 
                    className={`block truncate sm:text-sm ${icon ? 'ml-3' : ''} ${
                        displayValue ? 'text-text-primary' : 'text-text-secondary/70'
                    }`}
                >
                    {displayValue || placeholder}
                </span>
            </button>
            
            {/* Modal del Calendario */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up"
                    onClick={() => setIsModalOpen(false)} // Cierra al hacer clic en el fondo
                >
                    {/* Añadimos un panel con fondo para que el calendario flotante se vea bien */}
                    <div
                        className="bg-popup-bg backdrop-blur-lg rounded-2xl shadow-2xl border border-border-color p-4"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDayClick} 
                            locale={es}
                            defaultMonth={selectedDate || new Date()}
                            // --- INICIO DE LA MODIFICACIÓN ---
                            captionLayout="dropdown-buttons" // Permite seleccionar año y mes
                            fromYear={1990}
                            toYear={new Date().getFullYear() + 5} // Rango de años (extendido a +5)
                            formatters={{ formatCaption }} // Aplica el formateador personalizado
                            // --- FIN DE LA MODIFICACIÓN ---
                            weekStartsOn={1} // Lunes como primer día
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;