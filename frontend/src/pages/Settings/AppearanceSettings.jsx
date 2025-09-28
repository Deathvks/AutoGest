// autogest-app/frontend/src/pages/Settings/AppearanceSettings.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const AppearanceSettings = ({ isDarkMode, setIsDarkMode }) => {
    return (
        <div className="p-6 bg-component-bg rounded-xl border border-border-color">
            <h3 className="text-lg font-bold text-text-primary mb-4">APARIENCIA</h3>
            <div className="flex justify-between items-center">
                <span className="font-medium text-text-primary">MODO OSCURO</span>
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-full text-text-secondary transition-colors"
                >
                    <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                </button>
            </div>
        </div>
    );
};

export default AppearanceSettings;