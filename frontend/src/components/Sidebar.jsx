// autogest-app/frontend/src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, 
    faUser, faCog, faSignOutAlt, faUsersCog,
    faCreditCard,
    faBuilding,
    faBell // Añadido
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ onLogoutClick }) => {
    // Obtenemos 'user' y el nuevo 'unreadCount' del contexto
    const { user, unreadCount } = useContext(AuthContext);

    if (!user) {
        return null;
    }
    
    const canSeeDashboard = user.role === 'admin' || user.isOwner || !user.companyId;

    const navItems = [
        canSeeDashboard && { icon: faTachometerAlt, text: 'Dashboard', path: '/' },
        { icon: faCar, text: 'Mis Coches', path: '/cars' },
        { icon: faChartLine, text: 'Ventas', path: '/sales' },
        { icon: faFileInvoiceDollar, text: 'Gastos', path: '/expenses' },
        { icon: faBell, text: 'Notificaciones', path: '/notifications', badgeCount: unreadCount }, // Nuevo item
        { icon: faUser, text: 'Perfil', path: '/profile' },
        { icon: faCreditCard, text: 'Suscripción', path: '/subscription' },
    ].filter(Boolean); 

    const adminNav = user && (user.isOwner || user.canExpelUsers) ? 
        { icon: faUsersCog, text: 'Gestión', path: '/admin' } : null;

    const bottomItems = [
        { icon: faCog, text: 'Configuración', path: '/settings' },
    ];

    // Modificamos NavItem para que acepte 'badgeCount'
    const NavItem = ({ icon, text, path, badgeCount }) => (
        <NavLink 
            to={path} 
            end
            className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                isActive
                    ? 'bg-white/5 text-text-primary shadow-lg border border-white/10 backdrop-blur-sm'
                    : 'text-text-secondary hover:bg-component-bg-hover hover:text-text-primary'
                }`
            }
        >
            <FontAwesomeIcon icon={icon} className="w-5 h-5 mr-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-semibold flex-1">{text}</span>
            {badgeCount > 0 && (
                // --- INICIO DE LA MODIFICACIÓN ---
                <span className="bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {badgeCount}
                </span>
            )}
        </NavLink>
    );

    return (
        <aside className="hidden lg:flex lg:flex-col w-72 bg-component-bg p-6 border-r border-border-color">
            <div className="px-2 mb-8">
                <div className="flex items-center">
                    {user.logoUrl && (
                        <img src={user.logoUrl} alt="Logo" className="h-10 w-auto mr-3 rounded-md" />
                    )}
                    <h1 className="text-2xl font-bold text-text-primary">AutoGest</h1>
                </div>
                {user.businessName && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary border-t border-border-color pt-2 mt-2">
                        <FontAwesomeIcon icon={faBuilding} />
                        <span className="font-semibold truncate">{user.businessName}</span>
                    </div>
                )}
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map(item => <NavItem key={item.text} {...item} />)}
                {adminNav && <NavItem {...adminNav} />}
            </nav>

            <div className="space-y-2">
                {bottomItems.map(item => <NavItem key={item.text} {...item} />)}
                <button 
                    onClick={onLogoutClick}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-text-secondary rounded-xl hover:bg-red-accent/10 hover:text-red-accent transition-colors duration-200 group"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-4 transition-transform duration-200 group-hover:scale-110" />
                    <span className="font-semibold">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;