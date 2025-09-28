// autogest-app/frontend/src/pages/Settings/TaxSettings.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

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
        <div className="p-6 bg-component-bg rounded-xl border border-border-color">
            <h3 className="text-lg font-bold text-text-primary mb-4">IMPUESTOS</h3>
            <div className="flex justify-between items-center">
                <div>
                    <span className="font-medium text-text-primary">APLICAR IGIC (7%) EN FACTURAS</span>
                    <p className="text-xs text-text-secondary">Si se activa, se desglosará un 7% de IGIC en las facturas.</p>
                </div>
                <div className="flex items-center gap-4">
                    {igicMessage && <span className="text-sm text-green-accent font-medium">{igicMessage}</span>}
                    <button
                        type="button"
                        onClick={handleIgicToggle}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${igicEnabled ? 'bg-accent' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${igicEnabled ? 'translate-x-6' : 'translate-x-1'}`}></span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaxSettings;