// autogest-app/frontend/src/components/Select.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../context/ThemeContext';

const Select = ({ label, value, onChange, options, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { activeTheme } = useContext(ThemeContext);
    const selectRef = useRef(null);

    const internalValue = value ?? '';
    const selectedOption = options.find(opt => opt.id === internalValue);

    const handleSelect = (optionId) => {
        onChange(optionId);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={selectRef}>
            {label && <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">{label}</label>}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-full cursor-pointer rounded-lg bg-white py-2.5 px-4 pr-10 text-left border transition-colors flex items-center ${isOpen ? 'border-accent ring-1 ring-accent' : 'border-gray-300 hover:border-gray-400'}`}
            >
                {icon && (
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400 mr-3" aria-hidden="true" />
                )}
                <span className={`block truncate text-sm ${!selectedOption ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                    {selectedOption?.name || 'Selecciona una opción'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <FontAwesomeIcon icon={faChevronDown} className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : ''}`} aria-hidden="true" />
                </span>
            </button>

            {isOpen && (
                <ul 
                    className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg border border-gray-200 focus:outline-none sm:text-sm no-scrollbar"
                >
                    {options.map((option) => (
                        <li
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className={`relative cursor-pointer select-none py-2.5 pl-4 pr-9 hover:bg-gray-50 transition-colors ${selectedOption?.id === option.id ? 'bg-gray-50 text-accent font-bold' : 'text-gray-700'}`}
                        >
                            <span className="block truncate">
                                {option.name}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Select;