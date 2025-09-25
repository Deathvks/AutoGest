// autogest-app/frontend/src/components/modals/SubscriptionSuccessModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import SubscriptionBenefits from '../../pages/Subscription/SubscriptionBenefits';

const SubscriptionSuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-border-color">
                <div className="flex-shrink-0 text-center p-8 relative overflow-hidden bg-gradient-to-br from-component-bg to-accent/10 dark:from-component-bg dark:to-accent/20">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-[0.03]"></div>
                    <FontAwesomeIcon icon={faRocket} className="w-20 h-20 text-accent mx-auto mb-4 animate-rocket-liftoff" />
                    <h2 
                        className="text-3xl font-bold text-text-primary animate-fade-in-down"
                        style={{ animationDelay: '200ms', opacity: 0 }}
                    >
                        ¡BIENVENIDO A BORDO!
                    </h2>
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <p 
                        className="text-text-secondary mt-2 animate-fade-in-down"
                        style={{ animationDelay: '400ms', opacity: 0 }}
                    >
                        TU SUSCRIPCIÓN ESTÁ ACTIVA. HAS DESBLOQUEADO TODO EL POTENCIAL DE AUTOGEST.
                    </p>
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                </div>

                <div className="flex-grow overflow-y-auto p-6 animate-fade-in-up" style={{ animationDelay: '600ms', opacity: 0 }}>
                    <h3 className="text-lg font-semibold text-text-primary mb-6 text-center">ESTO ES TODO LO QUE AHORA PUEDES HACER:</h3>
                    <SubscriptionBenefits />
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-center p-6 border-t border-border-color bg-component-bg-hover">
                    <button 
                        onClick={onClose} 
                        className="bg-accent text-white px-10 py-3 rounded-lg shadow-[0_5px_20px_-5px_rgba(var(--color-accent-rgb),0.5)] hover:shadow-[0_8px_25px_-8px_rgba(var(--color-accent-rgb),0.8)] transition-all transform hover:scale-105 font-semibold flex items-center gap-2 animate-fade-in-up"
                        style={{ animationDelay: '800ms', opacity: 0 }}
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