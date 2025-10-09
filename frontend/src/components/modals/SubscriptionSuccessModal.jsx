// autogest-app/frontend/src/components/modals/SubscriptionSuccessModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import SubscriptionBenefits from '../../pages/Subscription/SubscriptionBenefits';

const SubscriptionSuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleCloseAndReload = () => {
        onClose();
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-border-color">
                <div className="flex-shrink-0 text-center p-8 relative overflow-hidden bg-gradient-to-br from-component-bg to-accent/10">
                    <FontAwesomeIcon icon={faRocket} className="w-20 h-20 text-accent mx-auto mb-4" style={{ animation: 'rocket-liftoff 0.8s ease-out' }} />
                    <h2 
                        className="text-3xl font-bold text-text-primary animate-fade-in-down"
                        style={{ animationDelay: '200ms' }}
                    >
                        ¡BIENVENIDO A BORDO!
                    </h2>
                    <p 
                        className="text-text-secondary mt-2 animate-fade-in-down"
                        style={{ animationDelay: '400ms' }}
                    >
                        TU SUSCRIPCIÓN ESTÁ ACTIVA. HAS DESBLOQUEADO TODO EL POTENCIAL DE AUTOGEST.
                    </p>
                </div>

                <div className="flex-grow overflow-y-auto p-6 animate-fade-in-up no-scrollbar" style={{ animationDelay: '600ms' }}>
                    <h3 className="text-lg font-semibold text-text-primary mb-6 text-center uppercase">Esto es todo lo que ahora puedes hacer:</h3>
                    <SubscriptionBenefits />
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-center p-6 border-t border-border-color bg-component-bg-hover rounded-b-2xl">
                    <button 
                        onClick={handleCloseAndReload}
                        className="bg-accent text-white px-10 py-3 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all transform hover:scale-105 font-semibold flex items-center gap-2"
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