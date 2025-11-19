// autogest-app/frontend/src/pages/Settings/ContactSettings.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

const ContactSettings = () => {
    const supportEmail = 'support@auto-gest.es';
    const [copyText, setCopyText] = useState('Copiar');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(supportEmail).then(() => {
            setCopyText('Copiado');
            setIsCopied(true);
            setTimeout(() => {
                setCopyText('Copiar');
                setIsCopied(false);
            }, 2000);
        }).catch(err => {
            console.error('Error al copiar el email: ', err);
        });
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">Contacto y Soporte</h3>
            <div className="space-y-6">
                <p className="text-sm text-gray-500 leading-relaxed">
                    ¿Tienes alguna duda, sugerencia o has encontrado un error? Nuestro equipo de soporte está aquí para ayudarte.
                </p>
                
                <div>
                    <a 
                        href={`mailto:${supportEmail}`}
                        title={`Abrir cliente de correo para enviar a ${supportEmail}`}
                        className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-bold px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm shadow-sm uppercase"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                        <span>Enviar Correo</span>
                    </a>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                        O copia la dirección manualmente:
                    </p>
                    <div className="flex items-center gap-2 p-1 pr-1.5 rounded-lg bg-gray-50 border border-gray-200 w-full sm:w-fit">
                        <span className="font-mono text-sm text-gray-700 px-3 select-all">{supportEmail}</span>
                        <button 
                            onClick={handleCopy} 
                            className={`ml-auto flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase shadow-sm ${isCopied ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
                        >
                            <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />
                            {copyText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSettings;