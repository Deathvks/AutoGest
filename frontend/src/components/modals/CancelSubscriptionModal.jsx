// autogest-app/frontend/src/components/modals/CancelSubscriptionModal.jsx
import React from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadTear, faCar, faChartLine, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';

const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    const benefits = [
        { icon: faCar, text: "Gestión de inventario ilimitada" },
        { icon: faChartLine, text: "Análisis de rentabilidad por coche" },
        { icon: faFileInvoiceDollar, text: "Facturación profesional" },
    ];

    const modalContent = (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg border border-gray-300 overflow-hidden">
                <div className="p-8 text-center bg-white">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
                        <FontAwesomeIcon icon={faSadTear} className="text-3xl text-accent" />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">¿De verdad te vas?</h2>
                    <p className="text-gray-600 mt-4 text-sm leading-relaxed font-medium">
                        Nos da pena verte partir. Si cancelas, perderás el acceso a herramientas clave para tu negocio:
                    </p>

                    <ul className="text-left space-y-3 my-6 inline-block">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                                <div className="w-6 flex justify-center">
                                    <FontAwesomeIcon icon={benefit.icon} className="text-accent" />
                                </div>
                                <span className="font-medium">{benefit.text}</span>
                            </li>
                        ))}
                    </ul>

                    <p className="text-xs text-gray-500 font-medium bg-gray-50 p-3 rounded border border-gray-200 text-center">
                        Tu plan seguirá activo hasta el final del periodo de facturación actual.
                    </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onConfirm}
                        className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Sí, Cancelar
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-lg shadow hover:bg-accent-hover transition-transform transform hover:scale-105 font-bold uppercase text-xs tracking-wide"
                    >
                        No, Quiero Quedarme
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default CancelSubscriptionModal;