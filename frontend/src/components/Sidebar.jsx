import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faCar,
    faTags,
    faWallet,
    faUser,
    faCog
} from '@fortawesome/free-solid-svg-icons';

// --- Datos de Navegación ---
const navItems = [
    { to: '/', label: 'Dashboard', icon: faChartLine },
    { to: '/cars', label: 'Mis Coches', icon: faCar },
    { to: '/sales', label: 'Ventas', icon: faTags },
    { to: '/expenses', label: 'Gastos', icon: faWallet },
    { to: '/profile', label: 'Perfil', icon: faUser },
    { to: '/settings', label: 'Ajustes', icon: faCog },
];

const Sidebar = () => {
    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/50 p-4 flex-col justify-between hidden lg:flex">
            <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 p-4 flex items-center gap-3">
                    <FontAwesomeIcon icon={faCar} className="w-7 h-7" />
                    <span>AutoGest</span>
                </div>
                <nav className="mt-8 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                                }`
                            }
                        >
                            <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                            <span className="ml-4 font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;