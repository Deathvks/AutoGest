// frontend/src/components/Select.jsx

import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

const Select = ({ label, value, onChange, options, icon }) => {
    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div>
            {label && <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>}
            <Listbox value={value} onChange={onChange}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-slate-50 dark:bg-slate-800 py-2 pl-3 pr-10 text-left border border-slate-200 dark:border-slate-700 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
                        {icon && (
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-slate-400" aria-hidden="true" />
                            </span>
                        )}
                        <span className={`block truncate ${icon ? 'pl-6' : ''}`}>{selectedOption?.name || 'Selecciona una opción'}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        </span>
                    </Listbox.Button>
                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        {/* El contenedor de opciones con los estilos solicitados */}
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10 border border-slate-300 dark:border-slate-600">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.id}
                                    className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200' : 'text-slate-900 dark:text-slate-200'}`}
                                    value={option.id}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {option.name}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                                    <FontAwesomeIcon icon={faCheck} className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
};

export default Select;