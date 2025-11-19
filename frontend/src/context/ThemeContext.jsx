// frontend/src/context/ThemeContext.jsx
import React, { createContext, useMemo, useEffect } from 'react';

// Definimos el tema único que coincide con los valores de index.css (Estilo Occident)
const theme = {
    name: 'Occident',
    id: 'occident',
    isDark: false, // El nuevo estilo es claro
    
    // Colores base
    backgroundSolid: '#f3f4f6',
    backgroundGradient: '#f3f4f6', // Fondo plano gris muy claro
    componentBg: '#ffffff',
    componentBgHover: '#f9fafb',
    border: '#d1d5db',
    
    // Textos
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    
    // Acento Principal (Rojo)
    accent: 'rgb(220, 0, 40)',
    accentHover: 'rgb(190, 0, 35)',
    accentRgb: '220, 0, 40', // Necesario para gráficas con rgba()
    
    // Estados
    redAccent: '#dc2626',
    greenAccent: '#16a34a',
    yellowAccent: '#ca8a04',
    blueAccent: '#2563eb',
    
    // Varios
    circlesBg: 'transparent',
    popupBg: '#ffffff',
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Eliminamos la lógica de selección de temas, forzamos el tema único
    const activeTheme = theme;

    useEffect(() => {
        const root = document.documentElement;
        // Nos aseguramos de quitar la clase dark para evitar conflictos de Tailwind
        root.classList.remove('dark');
        
        // Nota: Las variables CSS (--color-*) ya están definidas en index.css,
        // por lo que no es estrictamente necesario inyectarlas aquí,
        // pero mantenemos el contexto limpio para uso en JS (ej. Chart.js).
    }, []);

    const value = useMemo(() => ({
        themes: [theme],
        activeTheme,
    }), []);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};