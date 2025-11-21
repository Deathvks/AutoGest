// autogest-app/frontend/src/components/DatePicker.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, setMonth, setYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Select from './Select';
import 'react-day-picker/style.css';

const DatePicker = ({ label, value, onChange, placeholder = 'DD/MM/AAAA', icon = faCalendarDays }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'years'

    const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;
    const yearsScrollRef = useRef(null);

    const handleOpenModal = () => {
        if (selectedDate) setCurrentMonth(selectedDate);
        setViewMode('calendar');
        setIsModalOpen(true);
    };

    const handleDayClick = (date) => {
        if (date) onChange(format(date, 'yyyy-MM-dd'));
        setIsModalOpen(false);
    };

    const handleMonthChange = (monthIndex) => {
        setCurrentMonth(setMonth(currentMonth, parseInt(monthIndex)));
    };

    const handleYearClick = (year) => {
        setCurrentMonth(setYear(currentMonth, year));
        setViewMode('calendar');
    };

    // Scroll automático al año seleccionado cuando se abre la vista de años
    useEffect(() => {
        if (viewMode === 'years' && yearsScrollRef.current) {
            const selectedBtn = yearsScrollRef.current.querySelector('.bg-accent');
            if (selectedBtn) {
                selectedBtn.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        }
    }, [viewMode]);

    const months = useMemo(() => [
        { id: '0', name: 'Enero' }, { id: '1', name: 'Febrero' }, { id: '2', name: 'Marzo' },
        { id: '3', name: 'Abril' }, { id: '4', name: 'Mayo' }, { id: '5', name: 'Junio' },
        { id: '6', name: 'Julio' }, { id: '7', name: 'Agosto' }, { id: '8', name: 'Septiembre' },
        { id: '9', name: 'Octubre' }, { id: '10', name: 'Noviembre' }, { id: '11', name: 'Diciembre' }
    ], []);

    const yearsList = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const list = [];
        for (let i = 1990; i <= currentYear + 5; i++) list.push(i);
        return list; // Orden ascendente para la cuadrícula
    }, []);

    const displayValue = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '';

    // Formateador para capitalizar el mes en la cabecera nativa
    const formatCaption = (date, options) => {
        const string = format(date, 'LLLL yyyy', options);
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return (
        <div className="relative">
            {label && <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">{label}</label>}
            
            <button
                type="button"
                onClick={handleOpenModal}
                className="relative w-full cursor-pointer rounded-lg bg-white py-2.5 px-4 pr-10 text-left border border-gray-300 h-[42px] flex items-center transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            >
                {icon && <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" aria-hidden="true" />}
                <span className={`block truncate text-sm ${icon ? 'ml-3' : ''} ${displayValue ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {displayValue || placeholder}
                </span>
            </button>
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-fade-in-up backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-300 p-4 w-auto min-w-[340px] flex flex-col gap-2 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        
                        {/* --- CABECERA (Selects) --- */}
                        <div className="flex items-center justify-between gap-3 mb-2 w-full">
                            <div className="flex-1 min-w-0">
                                <Select value={currentMonth.getMonth().toString()} options={months} onChange={handleMonthChange} />
                            </div>
                            <button 
                                onClick={() => setViewMode(viewMode === 'calendar' ? 'years' : 'calendar')}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border w-28 ${
                                    viewMode === 'years' 
                                        ? 'bg-accent text-white border-accent shadow-md' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <span>{currentMonth.getFullYear()}</span>
                                <FontAwesomeIcon icon={faChevronDown} className={`w-3 h-3 transition-transform ${viewMode === 'years' ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* --- CUERPO --- */}
                        {/* Eliminada altura fija en el contenedor padre para permitir dinamismo */}
                        <div className="w-full relative">
                            {viewMode === 'calendar' ? (
                                // El calendario tiene altura automática
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDayClick} 
                                    month={currentMonth}
                                    onMonthChange={setCurrentMonth}
                                    locale={es}
                                    formatters={{ formatCaption }}
                                    style={{
                                        '--rdp-accent-color': 'var(--color-accent)',
                                        '--rdp-background-color': 'var(--color-component-bg-hover)',
                                    }}
                                    className="!m-0 w-full flex justify-center"
                                    classNames={{
                                        caption: 'flex justify-center pt-2 pb-2 relative items-center', // Visible y centrado
                                        caption_label: 'text-sm font-bold text-gray-800 capitalize',   // Texto visible, capitalizado
                                        nav: 'hidden', // Ocultamos flechas nativas
                                        table: 'w-full border-collapse',
                                        head_cell: 'text-gray-400 font-medium text-xs w-10 h-10 pb-2',
                                        cell: 'text-center p-0 relative focus-within:relative focus-within:z-20',
                                        day: 'h-10 w-10 p-0 font-medium text-sm rounded-full hover:bg-gray-100 focus:outline-none transition-colors mx-auto',
                                        day_selected: '!bg-accent !text-white hover:!bg-accent-hover font-bold',
                                        day_today: '!text-accent font-bold !border-accent', 
                                    }}
                                />
                            ) : (
                                // La vista de años tiene altura fija y scroll
                                <div ref={yearsScrollRef} className="grid grid-cols-4 gap-2 h-[300px] overflow-y-auto p-1 pr-2 no-scrollbar content-start">
                                    {yearsList.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => handleYearClick(year)}
                                            className={`py-2 rounded-lg text-sm font-medium transition-all ${
                                                year === currentMonth.getFullYear()
                                                    ? 'bg-accent text-white shadow-md scale-105 font-bold'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;