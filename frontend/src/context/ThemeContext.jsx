// frontend/src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useMemo } from 'react';

const themes = [
    // --- TEMAS OSCUROS ---
    {
        name: 'Púrpura (Defecto)',
        id: 'default-purple',
        isDark: true,
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
        popupBg: 'rgb(26, 22, 41)',
    },
    {
        name: 'Medianoche',
        id: 'midnight-blue',
        isDark: true,
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
        popupBg: 'rgb(30, 41, 59)',
    },
    {
        name: 'Esmeralda',
        id: 'emerald-green',
        isDark: true,
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
        popupBg: 'rgb(6, 78, 59)',
    },
    {
        name: 'Rubí',
        id: 'ruby-red',
        isDark: true,
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
        popupBg: 'rgb(127, 29, 29)',
    },
    // --- TEMAS CLAROS ---
    {
        name: 'Claro (Estándar)',
        id: 'light-standard',
        isDark: false,
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
        popupBg: '#ffffff',
    },
    {
        name: 'Claro (Azul)',
        id: 'light-blue',
        isDark: false,
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
        popupBg: '#ffffff',
    }
];

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
};

const getColorBrightness = (hex) => {
    try {
        const hexClean = hex.replace(/^#/, '');
        const r = parseInt(hexClean.substring(0, 2), 16);
        const g = parseInt(hexClean.substring(2, 4), 16);
        const b = parseInt(hexClean.substring(4, 6), 16);
        return ((r * 299) + (g * 587) + (b * 114)) / 1000;
    } catch (e) {
        return 128;
    }
};

const hexToHsl = (H) => {
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
      r = "0x" + H[1] + H[1];
      g = "0x" + H[2] + H[2];
      b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
      r = "0x" + H[1] + H[2];
      g = "0x" + H[3] + H[4];
      b = "0x" + H[5] + H[6];
    }
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    return { h, s, l };
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

    const _applyThemeToDOM = (theme) => {
        const root = document.documentElement;
        Object.keys(theme).forEach(key => {
            const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            if (key !== 'id' && key !== 'name' && key !== 'isDark') {
                root.style.setProperty(cssVarName, theme[key]);
            }
        });

        if (theme.isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        document.body.style.background = theme.background;
        document.body.style.backgroundAttachment = 'fixed';
    }

    const applyTheme = (themeId) => {
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;
        
        setCustomTheme(null);
        localStorage.removeItem('app-custom-theme');
        
        _applyThemeToDOM(theme);
        
        setActiveThemeId(theme.id);
        localStorage.setItem('app-theme', theme.id);
    };
    
    const applyCustomTheme = (hexColor) => {
        const rgbColor = hexToRgb(hexColor);
        if (!rgbColor) return;
        
        const { h, s } = hexToHsl(hexColor);
        const isProblematicRed = (h <= 15 || h >= 345) && s > 70;
        
        let newCustomTheme;

        if (isProblematicRed) {
            const base = themes.find(t => t.id === 'light-standard');
            newCustomTheme = {
                ...base,
                id: 'custom',
                name: 'Personalizado',
                accent: hexColor,
                accentHover: darkenColor(hexColor, 10),
                accentRgb: rgbColor,
                circlesBg: `linear-gradient(120deg, ${lightenColor(hexColor, 20)}, ${hexColor})`,
            };
        } else {
            const brightness = getColorBrightness(hexColor);
            const isLightColor = brightness > 150;
    
            const lastThemeId = localStorage.getItem('app-theme') || 'default-purple';
            const isBaseLight = themes.find(t => t.id === lastThemeId)?.isDark === false;
            const baseThemeId = (isBaseLight || isLightColor) ? 'light-standard' : 'default-purple';
            const base = themes.find(t => t.id === baseThemeId);
    
            newCustomTheme = {
                ...base,
                id: 'custom',
                name: 'Personalizado',
                isDark: !isLightColor && base.isDark,
                accent: hexColor,
                accentHover: isLightColor ? darkenColor(hexColor, 10) : lightenColor(hexColor, 10),
                accentRgb: rgbColor,
                background: isLightColor ? base.background : `linear-gradient(-70deg, ${darkenColor(hexColor, 30)}, ${darkenColor(hexColor, 15)})`,
                circlesBg: isLightColor ? `linear-gradient(120deg, ${lightenColor(hexColor, 20)}, ${hexColor})` : `linear-gradient(120deg, ${darkenColor(hexColor, 10)}, ${lightenColor(hexColor, 10)})`,
                popupBg: isLightColor ? '#ffffff' : darkenColor(hexColor, 40),
                textPrimary: isLightColor ? '#18181b' : '#f8fafc',
                textSecondary: isLightColor ? '#71717a' : '#cbd5e1',
                componentBg: isLightColor ? base.componentBg : 'rgba(255, 255, 255, 0.1)',
                componentBgHover: isLightColor ? base.componentBgHover : 'rgba(255, 255, 255, 0.15)',
                border: isLightColor ? base.border : 'rgba(255, 255, 255, 0.2)',
                redAccent: isLightColor ? 'rgb(220, 38, 38)' : 'rgb(239, 68, 68)',
            };
        }
        
        setCustomTheme(newCustomTheme);
        localStorage.setItem('app-custom-theme', hexColor);
        setActiveThemeId('custom');
        localStorage.setItem('app-theme', 'custom');

        _applyThemeToDOM(newCustomTheme);
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