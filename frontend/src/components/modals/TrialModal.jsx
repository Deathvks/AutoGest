// frontend/src/components/modals/TrialModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const TrialModal = ({ isOpen, onConfirm, onClose }) => {
    if (!isOpen) return null;

    const benefits = [
        'Añade coches sin límite',
        'Registra ventas y gastos',
        'Accede al dashboard de estadísticas',
        'Genera facturas proforma'
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border-color">
                <div className="text-center p-8 relative overflow-hidden bg-gradient-to-br from-component-bg to-accent/10">
                    <FontAwesomeIcon icon={faRocket} className="w-20 h-20 text-accent mx-auto mb-4" style={{ animation: 'rocket-liftoff 0.8s ease-out' }} />
                    <h2 
                        className="text-3xl font-bold text-text-primary animate-fade-in-down"
                        style={{ animationDelay: '200ms' }}
                    >
                        ¡Prueba AutoGest 3 Días!
                    </h2>
                    <p 
                        className="text-text-secondary mt-2 animate-fade-in-down"
                        style={{ animationDelay: '400ms' }}
                    >
                        Desbloquea las funciones principales y descubre todo lo que puedes hacer.
                    </p>
                </div>

                <div className="p-6">
                    <ul className="space-y-3">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm text-text-secondary">
                                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-accent" />
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-center text-text-secondary mt-6">
                        No se requiere tarjeta de crédito. Después de los 3 días, tu cuenta volverá a estar limitada hasta que te suscribas.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="w-full sm:w-auto bg-component-bg border border-border-color text-text-primary px-6 py-2.5 rounded-lg hover:bg-border-color transition-colors font-semibold"
                    >
                        Quizás más tarde
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all transform hover:scale-105 font-semibold flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faRocket} />
                        Comenzar Prueba Gratuita
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrialModal;