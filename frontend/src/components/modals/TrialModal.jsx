// autogest-app/frontend/src/components/modals/TrialModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

const TrialModal = ({ isOpen, onConfirm, onClose }) => {
    if (!isOpen) return null;

    const benefits = [
        'Añade coches sin límite',
        'Registra ventas y gastos',
        'Accede al dashboard de estadísticas',
        'Genera facturas proforma'
    ];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-gray-300 flex flex-col">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faRocket} className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Prueba Gratuita</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 flex-grow bg-white">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
                            ¡3 Días de Acceso Total!
                        </h3>
                        <p className="text-gray-600 text-sm font-medium">
                            Desbloquea todas las funciones premium sin compromiso.
                        </p>
                    </div>

                    <ul className="space-y-3 mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="font-bold uppercase text-xs tracking-wide">{benefit}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 flex items-start gap-3">
                        <FontAwesomeIcon icon={faRocket} className="text-blue-600 mt-1" />
                        <p className="text-xs text-blue-800 font-bold uppercase">
                             No se requiere tarjeta. Tu cuenta volverá al plan gratuito al finalizar.
                        </p>
                    </div>
                </div>

                {/* Footer Gris Claro */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
                    <button 
                        onClick={onClose}
                        className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Quizás más tarde
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="w-full sm:w-auto bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faRocket} />
                        Comenzar Prueba
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrialModal;