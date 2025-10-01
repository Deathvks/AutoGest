// autogest-app/frontend/src/components/BottomNav.jsx
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, 
    faCog
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

const BottomNav = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return null;
    }

    const technicianRoles = ['admin', 'technician', 'technician_subscribed'];

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se elimina el enlace a "Gestión" para despejar la barra de navegación.
    const navItems = [
        technicianRoles.includes(user.role) && { icon: faTachometerAlt, text: 'Dashboard', path: '/' },
        { icon: faCar, text: 'Coches', path: '/cars' },
        { icon: faChartLine, text: 'Ventas', path: '/sales' },
        { icon: faFileInvoiceDollar, text: 'Gastos', path: '/expenses' },
        { icon: faCog, text: 'Ajustes', path: '/settings' },
    ].filter(Boolean);
    // --- FIN DE LA MODIFICACIÓN ---

    const NavItem = ({ icon, text, path }) => (
        <NavLink 
            to={path} 
            end
            className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs font-medium transition-colors duration-200 ${
                isActive
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-accent'
                }`
            }
        >
            <FontAwesomeIcon icon={icon} className="w-5 h-5 mb-1" />
            <span>{text}</span>
        </NavLink>
    );

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-component-bg border-t border-border-color flex justify-around shadow-t-md">
            {navItems.map(item => <NavItem key={item.text} {...item} />)}
        </nav>
    );
};

export default BottomNav;