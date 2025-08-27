// autogest-app/frontend/src/components/BottomNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faCar,
    faWallet,
    faUser,
    faCog,
    faTags // <-- Icono añadido
} from '@fortawesome/free-solid-svg-icons';

// Array de items de navegación actualizado
const navItems = [
    { to: '/', label: 'Dashboard', icon: faChartLine },
    { to: '/cars', label: 'Coches', icon: faCar },
    { to: '/sales', label: 'Ventas', icon: faTags }, // <-- Enlace de Ventas añadido
    { to: '/expenses', label: 'Gastos', icon: faWallet },
    { to: '/profile', label: 'Perfil', icon: faUser },
    { to: '/settings', label: 'Ajustes', icon: faCog },
];

const BottomNav = () => {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-component-bg border-t border-border-color flex justify-around p-2 z-50">
            {navItems.map(item => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full p-2 rounded-lg transition-colors ${
                            isActive 
                            ? 'text-blue-accent' 
                            : 'text-text-secondary'
                        }`
                    }
                >
                    <FontAwesomeIcon icon={item.icon} className="w-6 h-6" />
                    <span className="text-xs mt-1">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;