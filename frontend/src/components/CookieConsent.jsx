// frontend/src/components/CookieConsent.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) {
            setIsVisible(false);
            return;
        }

        const consentKey = `cookie_consent_${user.id}`;
        
        const handleOpen = () => setIsVisible(true);
        window.addEventListener('openCookieConsent', handleOpen);

        const consent = localStorage.getItem(consentKey);
        if (!consent) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }

        return () => {
            window.removeEventListener('openCookieConsent', handleOpen);
        };
    }, [user]);
    
    if (!user) {
        return null;
    }
    
    const consentKey = `cookie_consent_${user.id}`;
    const handleChoice = (choice) => {
        localStorage.setItem(consentKey, choice);
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-6 z-[100] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] animate-fade-in-up">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-50 rounded-full text-accent flex-shrink-0">
                        <FontAwesomeIcon icon={faCookieBite} className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Este sitio web utiliza cookies</h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            Usamos cookies para mejorar tu experiencia. Consulta nuestra{' '}
                            <Link to="/cookie-policy" className="text-accent font-bold hover:underline">
                                Política de Cookies
                            </Link>
                            .
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">
                            Puedes cambiar tus preferencias en cualquier momento desde Ajustes.
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => handleChoice('accepted')}
                        className="w-full sm:w-auto bg-accent text-white font-bold px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors shadow-sm uppercase text-xs tracking-wide"
                    >
                        Aceptar Todas
                    </button>
                    <button
                        onClick={() => handleChoice('necessary')}
                        className="w-full sm:w-auto bg-white text-gray-700 font-bold px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm uppercase text-xs tracking-wide"
                    >
                        Solo Necesarias
                    </button>
                    <button
                        onClick={() => handleChoice('declined')}
                        className="w-full sm:w-auto text-gray-500 font-bold px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors uppercase text-xs tracking-wide"
                    >
                        Rechazar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;