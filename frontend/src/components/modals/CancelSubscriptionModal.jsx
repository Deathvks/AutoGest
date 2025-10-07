// autogest-app/frontend/src/components/modals/CancelSubscriptionModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadTear, faCar, faChartLine, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';

const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    const benefits = [
        { icon: faCar, text: "Gestión de inventario ilimitada" },
        { icon: faChartLine, text: "Análisis de rentabilidad por coche" },
        { icon: faFileInvoiceDollar, text: "Facturación profesional" },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg/80 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg border border-border-color">
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={faSadTear} className="w-16 h-16 text-accent mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-text-primary">¿De verdad te vas?</h2>
                    <p className="text-text-secondary mt-4">
                        Nos da pena verte partir. Si cancelas, perderás el acceso a herramientas clave para tu negocio:
                    </p>

                    <ul className="text-left space-y-3 my-6 inline-block">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm text-text-secondary">
                                <FontAwesomeIcon icon={benefit.icon} className="w-4 h-4 text-accent" />
                                <span>{benefit.text}</span>
                            </li>
                        ))}
                    </ul>

                    <p className="text-xs text-text-secondary">
                        Tu plan seguirá activo hasta el final del periodo de facturación actual.
                    </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover/50 rounded-b-2xl">
                    <button 
                        onClick={onConfirm}
                        className="w-full sm:w-auto bg-component-bg border border-border-color text-text-primary px-6 py-3 rounded-lg hover:bg-border-color transition-colors font-semibold"
                    >
                        Sí, Cancelar
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-transform transform hover:scale-105 font-semibold"
                    >
                        No, Quiero Quedarme
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelSubscriptionModal;