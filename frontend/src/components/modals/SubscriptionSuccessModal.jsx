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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-300">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-center items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-white w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Suscripción Activada</h2>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto no-scrollbar bg-white">
                    {/* Hero Section */}
                    <div className="text-center p-8 border-b border-gray-100">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-100">
                            <FontAwesomeIcon 
                                icon={faRocket} 
                                className="w-10 h-10 text-accent" 
                                style={{ animation: 'rocket-liftoff 0.8s ease-out' }} 
                            />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">
                            ¡Bienvenido a Bordo!
                        </h2>
                        <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
                            Tu suscripción está activa. Has desbloqueado todo el potencial de <strong>AutoGest</strong>.
                        </p>
                    </div>

                    {/* Benefits Section */}
                    <div className="p-8 bg-gray-50">
                        <h3 className="text-xs font-bold text-gray-500 mb-6 text-center uppercase tracking-wider">
                            Tus nuevas herramientas desbloqueadas:
                        </h3>
                        <SubscriptionBenefits />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 mt-auto flex justify-center p-6 border-t border-gray-200 bg-white">
                    <button 
                        onClick={handleCloseAndReload}
                        className="bg-accent text-white px-10 py-3.5 rounded-lg shadow-lg hover:bg-accent-hover transition-all transform hover:scale-105 font-bold uppercase text-sm flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Comenzar Ahora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionSuccessModal;