// autogest-app/frontend/src/components/modals/SubscriptionSuccessModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCheckCircle, faCar, faFileInvoiceDollar, faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons';
// --- INICIO DE LA MODIFICACIÓN ---
// Se corrige la ruta de importación para apuntar al componente refactorizado.
import SubscriptionBenefits from '../../pages/Subscription/SubscriptionBenefits';
// --- FIN DE LA MODIFICACIÓN ---

const SubscriptionSuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 text-center p-6 border-b border-border-color">
                    <FontAwesomeIcon icon={faRocket} className="w-16 h-16 text-accent mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-text-primary">¡BIENVENIDO A BORDO!</h2>
                    <p className="text-text-secondary mt-2">TU SUSCRIPCIÓN ESTÁ ACTIVA. HAS DESBLOQUEADO TODO EL POTENCIAL DE AUTOGEST.</p>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">ESTO ES TODO LO QUE AHORA PUEDES HACER:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group bg-component-bg-hover p-4 rounded-lg border border-border-color">
                            <FontAwesomeIcon icon={faCar} className="text-accent text-2xl mb-2" />
                            <h4 className="font-bold text-text-primary">Gestión de Inventario Sin Límites</h4>
                        </div>
                         <div className="group bg-component-bg-hover p-4 rounded-lg border border-border-color">
                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-accent text-2xl mb-2" />
                            <h4 className="font-bold text-text-primary">Análisis de Rentabilidad</h4>
                        </div>
                         <div className="group bg-component-bg-hover p-4 rounded-lg border border-border-color">
                            <FontAwesomeIcon icon={faChartLine} className="text-accent text-2xl mb-2" />
                            <h4 className="font-bold text-text-primary">Dashboard Inteligente</h4>
                        </div>
                         <div className="group bg-component-bg-hover p-4 rounded-lg border border-border-color">
                            <FontAwesomeIcon icon={faUsers} className="text-accent text-2xl mb-2" />
                            <h4 className="font-bold text-text-primary">Facturación Profesional</h4>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-center p-6 border-t border-border-color">
                    <button 
                        onClick={onClose} 
                        className="bg-accent text-white px-8 py-3 rounded-lg shadow-lg hover:bg-accent-hover transition-transform transform hover:scale-105 font-semibold flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        COMENZAR AHORA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionSuccessModal;