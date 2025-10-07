// autogest-app/frontend/src/components/BottomNav.jsx
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, 
    faCog
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

// --- INICIO DE LA MODIFICACIÓN ---
const BottomNav = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return null;
    }

    const technicianRoles = ['admin', 'technician', 'technician_subscribed'];

    const navItems = [
        technicianRoles.includes(user.role) && { icon: faTachometerAlt, text: 'Dashboard', path: '/' },
        { icon: faCar, text: 'Coches', path: '/cars' },
        { icon: faChartLine, text: 'Ventas', path: '/sales' },
        { icon: faFileInvoiceDollar, text: 'Gastos', path: '/expenses' },
        { icon: faCog, text: 'Ajustes', path: '/settings' },
    ].filter(Boolean);

    const NavItem = ({ icon, text, path }) => (
        <NavLink 
            to={path} 
            end
            className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs font-medium transition-colors duration-200 relative ${
                isActive
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-accent'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <div className={`relative flex items-center justify-center w-12 h-8`}>
                        <FontAwesomeIcon icon={icon} className="w-5 h-5 z-10" />
                        {isActive && (
                             <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 rounded-full bg-accent/20 transition-all duration-300"></span>
                        )}
                    </div>
                    <span>{text}</span>
                </>
            )}
        </NavLink>
    );

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-component-bg backdrop-blur-lg border-t border-border-color flex justify-around shadow-t-2xl">
            {navItems.map(item => <NavItem key={item.text} {...item} />)}
        </nav>
    );
};
// --- FIN DE LA MODIFICACIÓN ---

export default BottomNav;