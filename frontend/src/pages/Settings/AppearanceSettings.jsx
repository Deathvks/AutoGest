// autogest-app/frontend/src/pages/Settings/AppearanceSettings.jsx
import React, { useContext, useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faCheck, faEyeDropper } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { ChromePicker } from 'react-color';

const AppearanceSettings = ({ onPickerToggle }) => {
    const { themes, activeTheme, applyTheme, applyCustomTheme } = useContext(ThemeContext);
    const [customColor, setCustomColor] = useState(activeTheme.accent);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        if (activeTheme.id !== 'custom') {
            setCustomColor(activeTheme.accent);
        }
    }, [activeTheme]);

    useEffect(() => {
        onPickerToggle(isPickerVisible);
    }, [isPickerVisible, onPickerToggle]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsPickerVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCustomColorChange = (color) => {
        setCustomColor(color.hex);
        applyCustomTheme(color.hex);
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-text-primary mb-4 uppercase flex items-center gap-3">
                <FontAwesomeIcon icon={faPalette} className="w-5 h-5 text-accent" />
                <span>Paleta de Colores</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {themes.map((theme) => (
                    <div key={theme.id} className="text-center">
                        <button
                            onClick={() => applyTheme(theme.id)}
                            className={`w-full h-20 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${activeTheme.id === theme.id ? 'border-accent ring-2 ring-accent' : 'border-border-color hover:border-accent'}`}
                            style={{ background: theme.background }}
                            title={`Aplicar tema ${theme.name}`}
                        >
                            {activeTheme.id === theme.id && (
                                <FontAwesomeIcon icon={faCheck} className="text-white text-2xl" />
                            )}
                        </button>
                        <span className="text-xs font-semibold mt-2 block text-text-secondary">{theme.name}</span>
                    </div>
                ))}
                
                <div className={`text-center relative ${isPickerVisible ? 'z-10' : ''}`}>
                    <button
                        onClick={() => setIsPickerVisible(prev => !prev)}
                        className={`w-full h-20 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 bg-component-bg ${activeTheme.id === 'custom' ? 'border-accent ring-2 ring-accent' : 'border-border-color hover:border-accent'}`}
                        title="Seleccionar un color personalizado"
                    >
                        <div className="w-8 h-8 rounded-full border border-border-color" style={{ backgroundColor: customColor }}></div>
                        <FontAwesomeIcon icon={faEyeDropper} className="text-text-secondary text-lg" />
                    </button>
                    <span className="text-xs font-semibold mt-2 block text-text-secondary">Personalizado</span>
                    
                    {isPickerVisible && (
                        // --- INICIO DE LA MODIFICACIÓN ---
                        <div ref={pickerRef} className="absolute top-full mt-2 left-0 md:left-1/2 md:-translate-x-1/2 z-20">
                            <ChromePicker
                                color={customColor}
                                onChange={handleCustomColorChange}
                                disableAlpha={true}
                                className="custom-color-picker"
                            />
                        </div>
                        // --- FIN DE LA MODIFICACIÓN ---
                    )}
                </div>
            </div>
            <p className="text-center text-xs text-text-secondary mt-6">Más colores próximamente...</p>
        </div>
    );
};

export default AppearanceSettings;