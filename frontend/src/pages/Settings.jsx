// frontend/src/pages/Settings.jsx
import React, { useState, useContext } from 'react'; // <-- AÑADIDO useContext
import VersionIndicator from '../components/VersionIndicator';
import { APP_NAME } from '../config/version';
import { AuthContext } from '../context/AuthContext'; // <-- AÑADIDO

// Importar los nuevos componentes modularizados
import AppearanceSettings from './Settings/AppearanceSettings';
import BusinessDataSettings from './Settings/BusinessDataSettings';
import AccountDataSettings from './Settings/AccountDataSettings';
import ContactSettings from './Settings/ContactSettings';

const Settings = ({ 
    cars, 
    expenses, 
    incidents, 
    onDeleteAccountClick, 
    onBusinessDataClick, 
    businessDataMessage, 
    onLogoutClick 
}) => {
    const { user } = useContext(AuthContext); // <-- AÑADIDO
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

    // --- INICIO DE LA MODIFICACIÓN ---
    // Determina si el usuario debe ver la sección de datos de empresa
    const shouldShowBusinessData = user && (user.role === 'admin' || user.role === 'technician' || user.role === 'technician_subscribed' || user.companyId);
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-8">AJUSTES</h1>

            <div className="space-y-8">
                <div className={`bg-component-bg backdrop-blur-lg p-6 rounded-2xl border border-border-color shadow-2xl relative ${isColorPickerOpen ? 'z-10' : ''}`}>
                    <AppearanceSettings onPickerToggle={setIsColorPickerOpen} />
                </div>
                
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                {shouldShowBusinessData && (
                    <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl border border-border-color shadow-2xl">
                        <BusinessDataSettings 
                            onBusinessDataClick={onBusinessDataClick} 
                            businessDataMessage={businessDataMessage} 
                        />
                    </div>
                )}
                {/* --- FIN DE LA MODIFICACIÓN --- */}

                <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl border border-border-color shadow-2xl">
                    <AccountDataSettings 
                        cars={cars}
                        expenses={expenses}
                        incidents={incidents}
                        onLogoutClick={onLogoutClick}
                        onDeleteAccountClick={onDeleteAccountClick}
                    />
                </div>

                <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl border border-border-color shadow-2xl">
                    <ContactSettings />
                </div>

                <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl border border-border-color shadow-2xl lg:hidden">
                    <h3 className="text-lg font-bold text-text-primary mb-4">ACERCA DE</h3>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-text-primary">{APP_NAME}</span>
                        <VersionIndicator />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;