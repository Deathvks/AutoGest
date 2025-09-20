// frontend/src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, 
    faUser, faCog, faSignOutAlt, faUsersCog,
    // --- INICIO DE LA MODIFICACIÓN ---
    faCreditCard
    // --- FIN DE LA MODIFICACIÓN ---
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: faTachometerAlt, text: 'Dashboard', path: '/' },
        { icon: faCar, text: 'Mis Coches', path: '/cars' },
        { icon: faChartLine, text: 'Ventas', path: '/sales' },
        { icon: faFileInvoiceDollar, text: 'Gastos', path: '/expenses' },
        { icon: faUser, text: 'Perfil', path: '/profile' },
        // --- INICIO DE LA MODIFICACIÓN ---
        { icon: faCreditCard, text: 'Suscripción', path: '/subscription' },
        // --- FIN DE LA MODIFICACIÓN ---
    ];

    const adminNav = user && user.role === 'admin' ? 
        { icon: faUsersCog, text: 'Gestión', path: '/admin' } : null;

    const bottomItems = [
        { icon: faCog, text: 'Configuración', path: '/settings' },
    ];

    const NavItem = ({ icon, text, path }) => (
        <NavLink 
            to={path} 
            end
            className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:bg-component-bg-hover hover:text-text-primary'
                }`
            }
        >
            <FontAwesomeIcon icon={icon} className="w-5 h-5 mr-3" />
            <span>{text}</span>
        </NavLink>
    );

    return (
        <aside className="hidden lg:flex lg:flex-col w-64 bg-component-bg p-4 border-r border-border-color">
            <div className="flex items-center mb-8 px-4">
                <h1 className="text-2xl font-bold text-text-primary">AutoGest</h1>
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map(item => <NavItem key={item.text} {...item} />)}
                {adminNav && <NavItem {...adminNav} />}
            </nav>
            <div className="space-y-2">
                {bottomItems.map(item => <NavItem key={item.text} {...item} />)}
                <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-text-secondary rounded-lg hover:bg-red-accent/10 hover:text-red-accent transition-colors duration-200"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;