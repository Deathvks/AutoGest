// autogest-app/frontend/src/pages/Settings.jsx
import React from 'react';
import VersionIndicator from '../components/VersionIndicator';
import { APP_NAME } from '../config/version';

// Importar los nuevos componentes modularizados
import AppearanceSettings from './Settings/AppearanceSettings';
import TaxSettings from './Settings/TaxSettings';
import BusinessDataSettings from './Settings/BusinessDataSettings';
import AccountDataSettings from './Settings/AccountDataSettings';

const Settings = ({ 
    isDarkMode, 
    setIsDarkMode, 
    cars, 
    expenses, 
    incidents, 
    onDeleteAccountClick, 
    onBusinessDataClick, 
    businessDataMessage, 
    onLogoutClick 
}) => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-8">AJUSTES</h1>

            <div className="space-y-8">
                <AppearanceSettings 
                    isDarkMode={isDarkMode} 
                    setIsDarkMode={setIsDarkMode} 
                />
                
                <TaxSettings />

                <BusinessDataSettings 
                    onBusinessDataClick={onBusinessDataClick} 
                    businessDataMessage={businessDataMessage} 
                />

                <AccountDataSettings 
                    cars={cars}
                    expenses={expenses}
                    incidents={incidents}
                    onLogoutClick={onLogoutClick}
                    onDeleteAccountClick={onDeleteAccountClick}
                />

                <div className="p-6 bg-component-bg rounded-xl border border-border-color lg:hidden">
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