// autogest-app/frontend/src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, faCog, 
    faUsersCog, faCreditCard, faSignOutAlt, faLock
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import { APP_VERSION } from '../../version'; 

const Sidebar = ({ onLogoutClick }) => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    // --- INICIO DE LA MODIFICACIÓN ---
    const isSubscribed = user.subscriptionStatus === 'active';
    const isTrialActive = user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date();

    // La gestión está bloqueada si no es admin, no está suscrito y no tiene una prueba activa.
    const isManagementLocked = user.role !== 'admin' && !isSubscribed && !isTrialActive;

    const NavItem = ({ to, icon, children, locked = false }) => {
        const commonClasses = "flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors duration-200";
        
        if (locked) {
            return (
                <div 
                    className={`${commonClasses} text-text-secondary opacity-50 cursor-not-allowed relative group`}
                    title="Suscríbete para obtener todas las ventajas"
                >
                    <FontAwesomeIcon icon={icon} className="w-5 h-5 mr-3" />
                    <span className="flex-1">{children}</span>
                    <FontAwesomeIcon icon={faLock} className="w-4 h-4 ml-auto text-text-secondary" />
                </div>
            );
        }

        return (
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `${commonClasses} ${
                        isActive
                            ? 'bg-accent text-white shadow-lg'
                            : 'text-text-secondary hover:bg-component-bg-hover hover:text-text-primary'
                    }`
                }
            >
                <FontAwesomeIcon icon={icon} className="w-5 h-5 mr-3" />
                <span className="flex-1">{children}</span>
            </NavLink>
        );
    };
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className="bg-component-bg text-text-primary w-64 flex-shrink-0 flex flex-col border-r border-border-color h-screen sticky top-0">
            <div className="p-6 text-center border-b border-border-color">
                <Link to="/" className="text-2xl font-bold text-accent">AutoGest</Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavItem to="/" icon={faTachometerAlt}>Dashboard</NavItem>
                <NavItem to="/cars" icon={faCar}>Mis Coches</NavItem>
                <NavItem to="/sales" icon={faChartLine}>Ventas</NavItem>
                <NavItem to="/expenses" icon={faFileInvoiceDollar}>Gastos</NavItem>
                
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                {(user.role === 'admin' || user.isOwner || (user.companyId && user.canExpelUsers)) && (
                    <NavItem to="/admin" icon={faUsersCog} locked={isManagementLocked}>
                        Gestión
                    </NavItem>
                )}
                {/* --- FIN DE LA MODIFICACIÓN --- */}

                <NavItem to="/subscription" icon={faCreditCard}>Suscripción</NavItem>
            </nav>

            <div className="p-4 border-t border-border-color">
                <div className="flex items-center mb-4">
                    <img 
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=8b5cf6&color=fff`} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                        <p className="font-semibold text-sm text-text-primary">{user.name}</p>
                        <p className="text-xs text-text-secondary capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <NavItem to="/settings" icon={faCog}>Ajustes</NavItem>
                    <button
                        onClick={onLogoutClick}
                        className="w-full flex items-center px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
                 <div className="text-center mt-4">
                    <span className="text-xs text-text-secondary opacity-50">Versión {APP_VERSION}</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;