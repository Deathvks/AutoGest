// autogest-app/frontend/src/pages/Settings/ContactSettings.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCopy } from '@fortawesome/free-solid-svg-icons';

const ContactSettings = () => {
    const supportEmail = 'support@auto-gest.es';
    const [copyText, setCopyText] = useState('Copiar');

    const handleCopy = () => {
        navigator.clipboard.writeText(supportEmail).then(() => {
            setCopyText('¡Copiado!');
            setTimeout(() => setCopyText('Copiar'), 2000);
        }).catch(err => {
            console.error('Error al copiar el email: ', err);
        });
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-text-primary mb-4 uppercase">Contacto y Soporte</h3>
            <div className="p-6 bg-background/50 rounded-xl border border-border-color">
                <p className="text-sm text-text-secondary mb-4">
                    ¿Tienes alguna duda, sugerencia o has encontrado un error? Contacta con nuestro equipo de soporte.
                </p>
                
                <a 
                    href={`mailto:${supportEmail}`}
                    title={`Abrir cliente de correo para enviar a ${supportEmail}`}
                    className="inline-flex items-center justify-center gap-2 bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm border border-border-color"
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span>Enviar Correo</span>
                </a>

                <div className="mt-4 text-sm text-text-secondary">
                    <p>Si el botón no funciona, copia la dirección de correo:</p>
                    <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-background border border-border-color">
                        <span className="font-mono text-text-primary select-all">{supportEmail}</span>
                        <button 
                            onClick={handleCopy} 
                            className="ml-auto bg-component-bg-hover text-text-primary font-semibold px-3 py-1 rounded-md text-xs hover:bg-border-color transition-colors w-24 text-center border border-border-color"
                        >
                            <FontAwesomeIcon icon={faCopy} className="mr-1" />
                            {copyText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSettings;