// frontend/src/pages/Settings.jsx
import React, { useContext } from 'react';
import VersionIndicator from '../components/VersionIndicator';
import { APP_NAME } from '../config/version';
import { AuthContext } from '../context/AuthContext';

// Importar los nuevos componentes modularizados
import BusinessDataSettings from './Settings/BusinessDataSettings';
import AccountDataSettings from './Settings/AccountDataSettings';
import ContactSettings from './Settings/ContactSettings';

const Settings = ({ 
    cars, 
    expenses, 
    incidents, 
    onDeleteAccountClick, 
    onLogoutClick,
    onActivateTrialClick
}) => {
    const { user } = useContext(AuthContext);

    // Se añade la condición `user?.companyId` y se incluye el rol 'technician'
    const isSubscribed = user?.subscriptionStatus === 'active';
    const isTrialing = user?.trialExpiresAt && new Date(user.trialExpiresAt) > new Date();
    const isAdmin = user?.role === 'admin';
    const isTechnician = user?.role === 'technician'; // Se añade el rol de técnico
    const shouldShowBusinessData = isSubscribed || isTrialing || isAdmin || isTechnician || user?.companyId;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8 uppercase">Ajustes</h1>

            <div className="space-y-8">
                
                {shouldShowBusinessData && (
                    <div className="relative bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <BusinessDataSettings />
                    </div>
                )}

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <AccountDataSettings 
                        cars={cars}
                        expenses={expenses}
                        incidents={incidents}
                        onLogoutClick={onLogoutClick}
                        onDeleteAccountClick={onDeleteAccountClick}
                        onActivateTrialClick={onActivateTrialClick}
                    />
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <ContactSettings />
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:hidden">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">ACERCA DE</h3>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{APP_NAME}</span>
                        <VersionIndicator />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;