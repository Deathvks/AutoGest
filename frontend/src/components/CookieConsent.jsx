// frontend/src/components/CookieConsent.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

const CookieConsent = () => {
    // --- INICIO DE LA MODIFICACIÓN ---
    // 1. Todos los hooks se llaman incondicionalmente al principio.
    const [isVisible, setIsVisible] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        // 2. La lógica se ejecuta dentro del hook. Si no hay usuario, nos aseguramos de que el modal esté oculto.
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
    }, [user]); // El efecto se re-ejecuta cuando el usuario cambia (login/logout).
    
    // 3. Si no hay usuario, ahora devolvemos null después de los hooks.
    if (!user) {
        return null;
    }
    
    const consentKey = `cookie_consent_${user.id}`;
    const handleChoice = (choice) => {
        localStorage.setItem(consentKey, choice);
        setIsVisible(false);
    };
    // --- FIN DE LA MODIFICACIÓN ---

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 inset-x-0 bg-component-bg/80 backdrop-blur-lg border-t border-border-color p-4 z-[100] animate-fade-in-up">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <FontAwesomeIcon icon={faCookieBite} className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-text-primary">Este sitio web utiliza cookies</h3>
                        <p className="text-sm text-text-secondary">
                            Usamos cookies para mejorar tu experiencia. Consulta nuestra{' '}
                            <Link to="/cookie-policy" className="text-accent font-semibold">
                                Política de Cookies
                            </Link>
                            .
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                            Puedes cambiar tus preferencias en cualquier momento desde Ajustes.
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => handleChoice('accepted')}
                        className="w-full bg-accent text-white font-semibold px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 whitespace-nowrap"
                    >
                        Aceptar Todas
                    </button>
                    <button
                        onClick={() => handleChoice('necessary')}
                        className="w-full bg-component-bg-hover text-text-primary font-semibold px-6 py-2 rounded-lg hover:bg-border-color transition-colors whitespace-nowrap"
                    >
                        Solo Necesarias
                    </button>
                    <button
                        onClick={() => handleChoice('declined')}
                        className="w-full text-text-secondary font-semibold px-6 py-2 rounded-lg hover:bg-border-color transition-colors text-sm whitespace-nowrap"
                    >
                        Rechazar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;