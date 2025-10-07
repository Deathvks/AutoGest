// autogest-app/frontend/src/pages/Settings/TaxSettings.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPercentage } from '@fortawesome/free-solid-svg-icons';

const TaxSettings = () => {
    const { user, updateUserProfile } = useContext(AuthContext);
    const [igicEnabled, setIgicEnabled] = useState(user?.applyIgic || false);
    const [igicMessage, setIgicMessage] = useState('');

    const handleIgicToggle = async () => {
        const newIgicState = !igicEnabled;
        setIgicEnabled(newIgicState);
        try {
            await updateUserProfile({ applyIgic: newIgicState });
            setIgicMessage('¡GUARDADO!');
            setTimeout(() => setIgicMessage(''), 3000);
        } catch (error) {
            setIgicMessage('Error al guardar');
            setIgicEnabled(!newIgicState);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-text-primary mb-4 uppercase">Impuestos</h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-background/50 rounded-xl border border-border-color gap-4">
                <div>
                    <span className="font-semibold text-text-primary flex items-center gap-3">
                        <FontAwesomeIcon icon={faPercentage} className="w-5 h-5 text-accent" />
                        APLICAR IGIC (7%) EN FACTURAS
                    </span>
                    <p className="text-xs text-text-secondary mt-1">Si se activa, se desglosará un 7% de IGIC en las facturas.</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    {igicMessage && <span className="text-sm text-green-accent font-semibold">{igicMessage}</span>}
                    <button
                        type="button"
                        onClick={handleIgicToggle}
                        className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent ${igicEnabled ? 'bg-accent' : 'bg-component-bg-hover'}`}
                    >
                        <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${igicEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaxSettings;
