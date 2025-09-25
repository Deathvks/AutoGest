// autogest-app/frontend/src/components/modals/CancelSubscriptionModal.jsx
import React from 'react';
import ReactDOM from 'react-dom'; // <-- 1. Importar ReactDOM para usar portales
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadTear, faCar, faChartLine, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';

const BenefitItem = ({ icon, text }) => (
    <li className="flex items-center gap-3 text-sm text-text-secondary">
        <FontAwesomeIcon icon={icon} className="w-4 h-4 text-accent" />
        <span>{text}</span>
    </li>
);

const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    // --- INICIO DE LA MODIFICACIÓN ---
    // 2. Envolvemos todo el modal en ReactDOM.createPortal
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-border-color">
                <div className="p-8 text-center">
                    <FontAwesomeIcon icon={faSadTear} className="w-20 h-20 text-accent mx-auto mb-6 animate-fade-in-down" />
                    <h2 
                        className="text-2xl font-bold text-text-primary animate-fade-in-down"
                        style={{ animationDelay: '200ms', opacity: 0 }}
                    >
                        ¿DE VERDAD TE VAS?
                    </h2>
                    <p 
                        className="text-text-secondary mt-4 animate-fade-in-down"
                        style={{ animationDelay: '400ms', opacity: 0 }}
                    >
                        Nos da mucha pena verte partir. Si cancelas, perderás el acceso a herramientas clave para tu negocio:
                    </p>

                    <ul className="text-left space-y-3 my-6 inline-block animate-fade-in-up" style={{ animationDelay: '600ms', opacity: 0 }}>
                        <BenefitItem icon={faCar} text="Gestión de inventario ilimitada" />
                        <BenefitItem icon={faChartLine} text="Análisis de rentabilidad por coche" />
                        <BenefitItem icon={faFileInvoiceDollar} text="Facturación profesional" />
                    </ul>

                    <p className="text-xs text-text-secondary animate-fade-in-up" style={{ animationDelay: '800ms', opacity: 0 }}>
                        Tu plan seguirá activo hasta el final del periodo de facturación actual.
                    </p>
                </div>

                <div className="flex-shrink-0 mt-auto flex flex-col sm:flex-row-reverse justify-center items-center gap-4 p-6 border-t border-border-color bg-component-bg-hover">
                    <button 
                        onClick={onClose}
                        className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-lg shadow-lg hover:bg-accent-hover transition-transform transform hover:scale-105 font-semibold"
                    >
                        NO, QUIERO QUEDARME
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="w-full sm:w-auto text-text-secondary px-6 py-3 rounded-lg hover:bg-border-color transition-colors font-semibold"
                    >
                        SÍ, CANCELAR
                    </button>
                </div>
            </div>
        </div>,
        document.body // 3. Le decimos al portal que se renderice en el body
    );
    // --- FIN DE LA MODIFICACIÓN ---
};

export default CancelSubscriptionModal;