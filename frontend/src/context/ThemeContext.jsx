// autogest-app/frontend/src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useMemo } from 'react';

const themes = [
    // --- TEMAS OSCUROS ---
    {
        name: 'Púrpura (Defecto)',
        id: 'default-purple',
        background: 'linear-gradient(-70deg, rgb(53, 33, 90), rgb(92, 37, 165))',
        componentBg: 'rgba(255, 255, 255, 0.1)',
        componentBgHover: 'rgba(255, 255, 255, 0.15)',
        border: 'rgba(255, 255, 255, 0.2)',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        accent: 'rgb(168, 134, 226)',
        accentHover: 'rgb(187, 163, 233)',
        accentRgb: '168, 134, 226',
        redAccent: 'rgb(224, 123, 142)',
        circlesBg: 'linear-gradient(120deg, rgb(135, 60, 141), rgb(182, 85, 107))',
        popupBg: 'rgb(26, 22, 41)', // <-- MODIFICADO
    },
    {
        name: 'Medianoche',
        id: 'midnight-blue',
        background: 'linear-gradient(-70deg, rgb(17, 24, 39), rgb(30, 41, 59))',
        componentBg: 'rgba(255, 255, 255, 0.08)',
        componentBgHover: 'rgba(255, 255, 255, 0.12)',
        border: 'rgba(255, 255, 255, 0.15)',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        accent: 'rgb(156, 163, 175)',
        accentHover: 'rgb(209, 213, 219)',
        accentRgb: '156, 163, 175',
        redAccent: 'rgb(239, 68, 68)',
        circlesBg: 'linear-gradient(120deg, rgb(30, 58, 138), rgb(79, 70, 229))',
        popupBg: 'rgb(30, 41, 59)', // <-- MODIFICADO
    },
    {
        name: 'Esmeralda',
        id: 'emerald-green',
        background: 'linear-gradient(-70deg, #064e3b, #047857)',
        componentBg: 'rgba(255, 255, 255, 0.1)',
        componentBgHover: 'rgba(255, 255, 255, 0.15)',
        border: 'rgba(255, 255, 255, 0.2)',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        accent: 'rgb(52, 211, 153)',
        accentHover: 'rgb(110, 231, 183)',
        accentRgb: '52, 211, 153',
        redAccent: 'rgb(244, 63, 94)',
        circlesBg: 'linear-gradient(120deg, #10b981, #a7f3d0)',
        popupBg: 'rgb(6, 78, 59)', // <-- MODIFICADO
    },
    {
        name: 'Rubí',
        id: 'ruby-red',
        background: 'linear-gradient(-70deg, #7f1d1d, #b91c1c)',
        componentBg: 'rgba(255, 255, 255, 0.1)',
        componentBgHover: 'rgba(255, 255, 255, 0.15)',
        border: 'rgba(255, 255, 255, 0.2)',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        accent: 'rgb(252, 165, 165)',
        accentHover: 'rgb(254, 202, 202)',
        accentRgb: '252, 165, 165',
        redAccent: 'rgb(252, 165, 165)',
        circlesBg: 'linear-gradient(120deg, #fda4af, #f43f5e)',
        popupBg: 'rgb(127, 29, 29)', // <-- MODIFICADO
    },
    // --- TEMAS CLAROS ---
    {
        name: 'Claro (Estándar)',
        id: 'light-standard',
        background: '#f7f7f9',
        componentBg: '#ffffff',
        componentBgHover: '#f1f1f5',
        border: '#e4e4e7',
        textPrimary: '#18181b',
        textSecondary: '#71717a',
        accent: 'rgb(92, 37, 165)',
        accentHover: 'rgb(112, 57, 185)',
        accentRgb: '92, 37, 165',
        redAccent: '#c53030',
        circlesBg: 'linear-gradient(120deg, #e9d5ff, #c4b5fd)',
        popupBg: '#ffffff', // <-- MODIFICADO
    },
    {
        name: 'Claro (Azul)',
        id: 'light-blue',
        background: '#f7f7f9',
        componentBg: '#ffffff',
        componentBgHover: '#f1f1f5',
        border: '#e4e4e7',
        textPrimary: '#18181b',
        textSecondary: '#71717a',
        accent: 'rgb(37, 99, 235)',
        accentHover: 'rgb(59, 130, 246)',
        accentRgb: '37, 99, 235',
        redAccent: '#ef4444',
        circlesBg: 'linear-gradient(120deg, #dbeafe, #93c5fd)',
        popupBg: '#ffffff', // <-- MODIFICADO
    }
];

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
};

const lightenColor = (hex, percent) => {
    try {
        hex = hex.replace(/^#/, '');
        const num = parseInt(hex, 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    } catch (e) {
        return hex;
    }
};

const darkenColor = (hex, percent) => {
    try {
        hex = hex.replace(/^#/, '');
        const num = parseInt(hex, 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    } catch (e) {
        return hex;
    }
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [activeThemeId, setActiveThemeId] = useState(() => localStorage.getItem('app-theme') || 'default-purple');
    const [customTheme, setCustomTheme] = useState(null);

    const applyTheme = (themeId) => {
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;
        
        setCustomTheme(null);
        localStorage.removeItem('app-custom-theme');
        
        const root = document.documentElement;
        Object.keys(theme).forEach(key => {
            const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            if (key !== 'id' && key !== 'name') {
                root.style.setProperty(cssVarName, theme[key]);
            }
        });

        document.body.style.background = theme.background;
        document.body.style.backgroundAttachment = 'fixed';
        
        setActiveThemeId(theme.id);
        localStorage.setItem('app-theme', theme.id);
    };
    
    const applyCustomTheme = (hexColor) => {
        const rgbColor = hexToRgb(hexColor);
        if (!rgbColor) return;
        
        const lastThemeId = localStorage.getItem('app-theme') || 'default-purple';
        const isBaseLight = themes.find(t => t.id === lastThemeId && t.id !== 'custom')?.background.startsWith('#');
        const base = isBaseLight ? themes.find(t => t.id === 'light-standard') : themes.find(t => t.id === 'default-purple');

        const newCustomTheme = {
            ...base,
            id: 'custom',
            name: 'Personalizado',
            accent: hexColor,
            accentHover: lightenColor(hexColor, 10),
            accentRgb: rgbColor,
            background: isBaseLight ? base.background : `linear-gradient(-70deg, ${darkenColor(hexColor, 30)}, ${darkenColor(hexColor, 15)})`,
            circlesBg: isBaseLight ? `linear-gradient(120deg, ${lightenColor(hexColor, 20)}, ${hexColor})` : `linear-gradient(120deg, ${darkenColor(hexColor, 10)}, ${lightenColor(hexColor, 10)})`,
            popupBg: isBaseLight ? '#ffffff' : darkenColor(hexColor, 40), // <-- MODIFICADO
        };
        
        setCustomTheme(newCustomTheme);
        localStorage.setItem('app-custom-theme', hexColor);
        setActiveThemeId('custom');
        localStorage.setItem('app-theme', 'custom');

        const root = document.documentElement;
        Object.keys(newCustomTheme).forEach(key => {
            const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            if (key !== 'id' && key !== 'name') {
                root.style.setProperty(cssVarName, newCustomTheme[key]);
            }
        });
        document.body.style.background = newCustomTheme.background;
        document.body.style.backgroundAttachment = 'fixed';
    };

    useEffect(() => {
        const savedThemeId = localStorage.getItem('app-theme');
        const savedCustomColor = localStorage.getItem('app-custom-theme');

        if (savedThemeId === 'custom' && savedCustomColor) {
            applyCustomTheme(savedCustomColor);
        } else {
            applyTheme(savedThemeId || 'default-purple');
        }
    }, []);

    const value = useMemo(() => ({
        themes,
        activeTheme: customTheme || themes.find(t => t.id === activeThemeId) || themes[0],
        applyTheme,
        applyCustomTheme,
    }), [activeThemeId, customTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};