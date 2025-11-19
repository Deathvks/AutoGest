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
            setIgicMessage('Guardado');
            setTimeout(() => setIgicMessage(''), 3000);
        } catch (error) {
            setIgicMessage('Error');
            setIgicEnabled(!newIgicState);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">Impuestos</h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                         <FontAwesomeIcon icon={faPercentage} className="w-4 h-4 text-accent" />
                         <span className="font-bold text-gray-900 text-sm uppercase">Aplicar IGIC (7%) en Facturas</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-6">Si se activa, se desglosará un 7% de IGIC en las facturas.</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    {igicMessage && <span className={`text-sm font-bold uppercase ${igicMessage === 'Error' ? 'text-red-600' : 'text-green-600'}`}>{igicMessage}</span>}
                    <button
                        type="button"
                        onClick={handleIgicToggle}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${igicEnabled ? 'bg-accent' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-sm ${igicEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaxSettings;