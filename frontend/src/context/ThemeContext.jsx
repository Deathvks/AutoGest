// frontend/src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
// --- INICIO DE LA MODIFICACIÓN ---
// Se elimina la importación de AuthContext ya que no se usará
// --- FIN DE LA MODIFICACIÓN ---

const themes = [
    // --- TEMAS OSCUROS ---
    // Se eliminan todos los temas excepto 'midnight-blue'
    {
        name: 'Medianoche',
        id: 'midnight-blue',
        isDark: true,
        // --- INICIO DE LA MODIFICACIÓN ---
        // Volvemos a tener una única variable 'background' para el gradiente
        background: 'linear-gradient(-70deg, rgb(17, 24, 39), rgb(30, 41, 59))',
        // --- FIN DE LA MODIFICACIÓN ---
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
    }
    // Se eliminan los demás temas (Púrpura, Esmeralda, Rubí y los claros)
];

// --- INICIO DE LA MODIFICACIÓN ---
// Se eliminan las funciones auxiliares (hexToRgb, getColorBrightness, hexToHsl, lightenColor, darkenColor)
// ya que no se usarán para temas personalizados.
// --- FIN DE LA MODIFICACIÓN ---

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se elimina toda la lógica de estado, selección de tema y tema personalizado.
    // Solo nos quedamos con el tema "Medianoche".
    const activeTheme = themes[0]; // Siempre es "Medianoche"
    // --- FIN DE LA MODIFICACIÓN ---

    const _applyThemeToDOM = (theme) => {
        const root = document.documentElement;
        Object.keys(theme).forEach(key => {
            // --- INICIO DE LA MODIFICACIÓN ---
            // Volvemos a la lógica simple de mapeo
            const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            // --- FIN DE LA MODIFICACIÓN ---
            if (key !== 'id' && key !== 'name' && key !== 'isDark') {
                root.style.setProperty(cssVarName, theme[key]);
            }
        });

        if (theme.isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // --- INICIO DE LA MODIFICACIÓN ---
        // Nos aseguramos de que no se manipule el style del body desde aquí
        // --- FIN DE LA MODIFICACIÓN ---
    }

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se eliminan las funciones applyTheme y applyCustomTheme.
    // Se elimina el `useContext` de AuthContext.
    // --- FIN DE LA MODIFICACIÓN ---

    useEffect(() => {
        // --- INICIO DE LA MODIFICACIÓN ---
        // Se aplica el tema "Medianoche" directamente al cargar,
        // eliminando la lógica de `localStorage` y `user`.
        _applyThemeToDOM(activeTheme);
        // --- FIN DE LA MODIFICACIÓN ---
    }, [activeTheme]); // Se mantiene `activeTheme` como dependencia por si acaso, aunque ahora es constante.

    const value = useMemo(() => ({
        themes, // Solo contiene "Medianoche"
        activeTheme, // Siempre es "Medianoche"
        // Se eliminan applyTheme y applyCustomTheme del valor del contexto
    }), [activeTheme]);
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};