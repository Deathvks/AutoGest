// autogest-app/frontend/src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, 
    faUser, faCog, faSignOutAlt, faUsersCog,
    faCreditCard,
    faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

// --- INICIO DE LA MODIFICACIÓN ---
// Se define la URL base del API para construir correctamente las rutas de las imágenes.
const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';
// --- FIN DE LA MODIFICACIÓN ---

const Sidebar = ({ onLogoutClick }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return null;
    }
    
    const technicianRoles = ['admin', 'technician', 'technician_subscribed'];

    const navItems = [
        technicianRoles.includes(user.role) && { icon: faTachometerAlt, text: 'Dashboard', path: '/' },
        { icon: faCar, text: 'Mis Coches', path: '/cars' },
        { icon: faChartLine, text: 'Ventas', path: '/sales' },
        { icon: faFileInvoiceDollar, text: 'Gastos', path: '/expenses' },
        { icon: faUser, text: 'Perfil', path: '/profile' },
        { icon: faCreditCard, text: 'Suscripción', path: '/subscription' },
    ].filter(Boolean); 

    const adminNav = user && technicianRoles.includes(user.role) ? 
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
            <div className="flex items-center mb-2 px-4">
                 {/* --- INICIO DE LA MODIFICACIÓN --- */}
                 {/* Se corrige la ruta de la imagen del logo */}
                {user.logoUrl && (
                    <img src={`${API_BASE_URL}${user.logoUrl}`} alt="Logo" className="h-8 w-auto mr-3" />
                )}
                 {/* --- FIN DE LA MODIFICACIÓN --- */}
                <h1 className="text-2xl font-bold text-text-primary">AutoGest</h1>
            </div>

            {user.businessName && (
                <div className="px-4 mb-6">
                    <div className="flex items-center gap-2 text-xs text-text-secondary border-t border-border-color pt-2">
                        <FontAwesomeIcon icon={faBuilding} />
                        <span className="font-semibold truncate">{user.businessName}</span>
                    </div>
                </div>
            )}

            <nav className="flex-1 space-y-2">
                {navItems.map(item => <NavItem key={item.text} {...item} />)}
                {adminNav && <NavItem {...adminNav} />}
            </nav>
            <div className="space-y-2">
                {bottomItems.map(item => <NavItem key={item.text} {...item} />)}
                <button 
                    onClick={onLogoutClick}
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