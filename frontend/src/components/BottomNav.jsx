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

    const canSeeDashboard = user.role === 'admin' || user.isOwner || !user.companyId;

    const navItems = [
        canSeeDashboard && { icon: faTachometerAlt, text: 'Dashboard', path: '/' },
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
                `flex flex-col items-center justify-center w-full pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-[10px] font-bold uppercase transition-colors duration-200 relative ${
                isActive
                    ? 'text-accent'
                    : 'text-gray-400 hover:text-gray-600'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <span className="absolute top-0 inset-x-0 h-0.5 bg-accent shadow-[0_0_8px_rgba(220,0,40,0.5)] mx-4 rounded-b-full"></span>
                    )}
                    <div className="mb-1">
                        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                    </div>
                    <span className="tracking-wide">{text}</span>
                </>
            )}
        </NavLink>
    );

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            {navItems.map(item => <NavItem key={item.text} {...item} />)}
        </nav>
    );
};

export default BottomNav;