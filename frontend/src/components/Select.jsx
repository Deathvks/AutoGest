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
            {label && <label className="block text-sm font-semibold text-text-primary mb-1 uppercase">{label}</label>}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-full cursor-pointer rounded-lg bg-component-bg-hover py-2 px-4 pr-10 text-left border-none h-[42px] flex items-center"
            >
                {icon && (
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                )}
                <span className={`block truncate text-text-primary sm:text-sm ${icon ? 'ml-3' : ''}`}>
                    {selectedOption?.name || 'Selecciona una opción'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <FontAwesomeIcon icon={faChevronDown} className={`h-4 w-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </span>
            </button>

            {isOpen && (
                <ul 
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-popup-bg backdrop-blur-lg py-1 text-base shadow-lg focus:outline-none sm:text-sm border border-border-color"
                >
                    {options.map((option) => (
                        <li
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className="text-text-primary relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-component-bg-hover"
                            style={{ '--hover-color': activeTheme.accent }}
                        >
                            <span className={`block truncate ${selectedOption?.id === option.id ? 'font-semibold' : 'font-normal'}`}>
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