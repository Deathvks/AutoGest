// autogest-app/frontend/src/pages/Settings.jsx
import React from 'react';
import VersionIndicator from '../components/VersionIndicator';
import { APP_NAME } from '../config/version';

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
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-8">AJUSTES</h1>

            <div className="space-y-8">
                <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl border border-border-color shadow-2xl">
                    <AppearanceSettings />
                </div>
                
                <div className="bg-component-bg backdrop-blur-lg p-6 rounded-2xl border border-border-color shadow-2xl">
                    <BusinessDataSettings 
                        onBusinessDataClick={onBusinessDataClick} 
                        businessDataMessage={businessDataMessage} 
                    />
                </div>

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