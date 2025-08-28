// autogest-app/frontend/src/components/Select.jsx
import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

const Select = ({ label, value, onChange, options, icon }) => {
    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div>
            {label && <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>}
            <Listbox value={value} onChange={onChange}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-background py-2 pl-3 pr-10 text-left border border-border-color focus:outline-none focus-visible:border-blue-accent focus-visible:ring-1 focus-visible:ring-blue-accent sm:text-sm text-text-primary">
                        {icon && (
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                            </span>
                        )}
                        <span className={`block ${icon ? 'pl-6' : ''}`}>{selectedOption?.name || 'Selecciona una opción'}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                        </span>
                    </Listbox.Button>
                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-component-bg py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10 border border-border-color">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.id}
                                    className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-accent text-white' : 'text-text-primary'}`}
                                    value={option.id}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {option.name}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-accent">
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