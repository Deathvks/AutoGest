// autogest-app/frontend/src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, faCog, 
    faUsersCog, faCreditCard, faSignOutAlt, faLock, faRocket, faBell
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import { APP_VERSION } from '../config/version'; 

const TrialCountdownSidebar = () => {
    const { trialTimeLeft } = useContext(AuthContext);

    if (!trialTimeLeft) {
        return <span className="block text-xs font-bold">Prueba Expirada</span>;
    }

    const { days, hours, minutes, seconds } = trialTimeLeft;
    let timeLeftString = '';
    if (days > 0) {
        timeLeftString = `Quedan: ${days}d ${hours}h`;
    } else if (hours > 0) {
        timeLeftString = `Quedan: ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        timeLeftString = `Quedan: ${minutes}m ${seconds}s`;
    } else {
        timeLeftString = `Quedan: ${seconds}s`;
    }

    return <span className="block text-xs font-bold">{timeLeftString}</span>;
};

const Sidebar = ({ onLogoutClick }) => {
    const { user, subscriptionStatus, isTrialActive, unreadCount } = useContext(AuthContext);

    if (!user) return null;

    const isExempt = user.role === 'admin' || user.role === 'technician';
    const hasValidSubscription = subscriptionStatus === 'active' || (subscriptionStatus === 'cancelled' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date());
    
    const getStatusText = () => {
        if (isExempt || hasValidSubscription) return 'Pro';
        if (isTrialActive) return 'Prueba';
        return 'Free';
    };

    const userStatusText = getStatusText();
    
    const isSubscribed = subscriptionStatus === 'active';
    const isManagementLocked = isTrialActive && !isSubscribed && user.role !== 'admin';

    const NavItem = ({ to, icon, children, locked = false, count }) => {
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
                {count > 0 && (
                    <span className="bg-white/20 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                        {count}
                    </span>
                )}
            </NavLink>
        );
    };

    return (
        <div className="hidden lg:flex bg-component-bg text-text-primary w-64 flex-shrink-0 flex-col border-r border-border-color h-screen sticky top-0">
            <div className="p-6 text-center border-b border-border-color">
                <Link to="/" className="text-2xl font-bold text-accent">AutoGest</Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavItem to="/" icon={faTachometerAlt}>Dashboard</NavItem>
                <NavItem to="/cars" icon={faCar}>Mis Coches</NavItem>
                <NavItem to="/sales" icon={faChartLine}>Ventas</NavItem>
                <NavItem to="/expenses" icon={faFileInvoiceDollar}>Gastos</NavItem>
                
                {(user.role === 'admin' || user.isOwner || (user.companyId && user.canExpelUsers)) && (
                    <NavItem to="/admin" icon={faUsersCog} locked={isManagementLocked}>
                        Gestión
                    </NavItem>
                )}
                <NavItem to="/notifications" icon={faBell} count={unreadCount}>Notificaciones</NavItem>
                <NavItem to="/subscription" icon={faCreditCard}>Suscripción</NavItem>
            </nav>

            {isTrialActive && !hasValidSubscription && (
                <div className="px-4 pb-4">
                    <div className="p-4 rounded-lg bg-accent/10 text-accent">
                        <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faRocket} className="h-5 w-5" />
                            <div className="flex-1">
                                <div className="font-bold text-sm">Prueba Gratuita</div>
                                <TrialCountdownSidebar />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 border-t border-border-color">
                <div className="space-y-2">
                    <Link 
                        to="/profile" 
                        className="flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg text-text-secondary hover:bg-component-bg-hover hover:text-text-primary transition-colors duration-200"
                    >
                        <img 
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=8b5cf6&color=fff`} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 mr-3"
                        />
                        <div className="truncate">
                            <p className="font-semibold text-sm text-text-primary truncate">{user.name}</p>
                            {/* --- INICIO DE LA MODIFICACIÓN --- */}
                            <p className="text-xs text-text-secondary capitalize truncate">
                                {userStatusText}
                                {user.companyId && user.businessName && ` / ${user.businessName}`}
                            </p>
                            {/* --- FIN DE LA MODIFICACIÓN --- */}
                        </div>
                    </Link>
                    
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