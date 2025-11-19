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
        return <span className="block text-xs font-bold mt-1">Prueba Expirada</span>;
    }

    const { days, hours, minutes, seconds } = trialTimeLeft;
    let timeLeftString = '';
    if (days > 0) {
        timeLeftString = `${days}d ${hours}h restantes`;
    } else if (hours > 0) {
        timeLeftString = `${hours}h ${minutes}m restantes`;
    } else if (minutes > 0) {
        timeLeftString = `${minutes}m ${seconds}s restantes`;
    } else {
        timeLeftString = `${seconds}s restantes`;
    }

    return <span className="block text-xs font-bold mt-1">{timeLeftString}</span>;
};

const Sidebar = ({ onLogoutClick }) => {
    const { user, subscriptionStatus, isTrialActive, unreadCount } = useContext(AuthContext);

    if (!user) return null;

    const isExempt = user.role === 'admin' || user.role === 'technician';
    const hasValidSubscription = subscriptionStatus === 'active' || (subscriptionStatus === 'cancelled' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date());
    
    const getStatusText = () => {
        if (isExempt || hasValidSubscription) return 'Pro';
        if (isTrialActive) return 'Prueba';
        return 'Gratis';
    };

    const userStatusText = getStatusText();
    const isManagementLocked = isTrialActive && !hasValidSubscription && user.role !== 'admin';

    // Lógica para mostrar/ocultar el Dashboard
    const canSeeDashboard = 
        user.role === 'admin' || 
        user.role === 'technician' || 
        user.role === 'technician_subscribed' || 
        !!user.companyId || // Si está en un equipo
        hasValidSubscription || // Si tiene suscripción
        isTrialActive; // Si está en prueba

    const NavItem = ({ to, icon, children, locked = false, count }) => {
        const baseClasses = "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200";
        
        if (locked) {
            return (
                <div 
                    className={`${baseClasses} text-text-secondary opacity-60 cursor-not-allowed relative group bg-gray-50`}
                    title="Suscríbete para obtener todas las ventajas"
                >
                    <FontAwesomeIcon icon={icon} className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="flex-1">{children}</span>
                    <FontAwesomeIcon icon={faLock} className="w-3 h-3 ml-auto text-gray-400" />
                </div>
            );
        }

        return (
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `${baseClasses} ${
                        isActive
                            ? 'bg-accent text-white shadow-sm' // Rojo sólido con texto blanco
                            : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary' // Gris claro al hover
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        <FontAwesomeIcon 
                            icon={icon} 
                            className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-accent/80'}`} 
                        />
                        <span className="flex-1">{children}</span>
                        {count > 0 && (
                            <span className={`text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto ${isActive ? 'bg-white text-accent' : 'bg-accent text-white'}`}>
                                {count}
                            </span>
                        )}
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <div className="hidden lg:flex bg-white text-text-primary w-64 flex-shrink-0 flex-col border-r border-border-color h-screen sticky top-0 shadow-sm z-20">
            {/* Header del Sidebar */}
            <div className="h-16 flex items-center px-6 border-b border-border-color bg-white">
                <Link to="/" className="text-2xl font-extrabold tracking-tight text-accent flex items-center gap-2">
                    AutoGest
                </Link>
            </div>

            {/* Navegación Principal */}
            <nav className="flex-1 px-3 py-6 space-y-4 overflow-y-auto no-scrollbar">
                {canSeeDashboard && (
                    <NavItem to="/" icon={faTachometerAlt}>Dashboard</NavItem>
                )}
                <NavItem to="/cars" icon={faCar}>Mis Coches</NavItem>
                <NavItem to="/sales" icon={faChartLine}>Ventas</NavItem>
                <NavItem to="/expenses" icon={faFileInvoiceDollar}>Gastos</NavItem>
                
                {/* Separador sutil */}
                <div className="my-4 border-t border-gray-100 mx-2"></div>
                
                <NavItem to="/notifications" icon={faBell} count={unreadCount}>Notificaciones</NavItem>
                
                {(user.role === 'admin' || user.isOwner || (user.companyId && user.canExpelUsers)) && (
                    <NavItem to="/admin" icon={faUsersCog} locked={isManagementLocked}>
                        Administración
                    </NavItem>
                )}
                <NavItem to="/subscription" icon={faCreditCard}>Suscripción</NavItem>
            </nav>

            {/* Banner de Prueba (si aplica) */}
            {isTrialActive && !hasValidSubscription && (
                <div className="px-4 pb-4">
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 shadow-sm">
                        <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faRocket} className="h-5 w-5 mt-0.5 text-yellow-600" />
                            <div className="flex-1">
                                <div className="font-bold text-sm">Prueba Activa</div>
                                <TrialCountdownSidebar />
                                <Link to="/subscription" className="text-xs font-semibold underline mt-1 block hover:text-yellow-900">
                                    Suscribirse
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pie del Sidebar (Usuario) */}
            <div className="p-4 border-t border-border-color bg-white">
                {/* Enlace al perfil restaurado */}
                <Link 
                    to="/profile" 
                    className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all border border-transparent hover:border-border-color group"
                >
                     <img 
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=dc2626&color=fff`} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-accent/20 transition-colors"
                    />
                    <div className="min-w-0 overflow-hidden text-left">
                        <p className="text-sm font-bold text-text-primary truncate group-hover:text-accent transition-colors">{user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-text-secondary truncate">
                            <span className={`inline-block w-2 h-2 rounded-full ${userStatusText === 'Pro' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            {userStatusText}
                            {user.companyId && user.businessName && <span className="opacity-75"> • {user.businessName}</span>}
                        </div>
                    </div>
                </Link>

                <div className="space-y-1">
                    <Link 
                        to="/settings" 
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-text-secondary rounded-md hover:bg-gray-50 hover:text-accent hover:shadow-sm transition-all border border-transparent hover:border-border-color"
                    >
                         <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-2" />
                         Ajustes
                    </Link>
                    
                    <button
                        onClick={onLogoutClick}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-text-secondary rounded-md hover:bg-gray-50 hover:text-red-600 hover:shadow-sm transition-all border border-transparent hover:border-border-color"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
                 <div className="text-center mt-4">
                    <span className="text-[10px] text-gray-400 font-mono">v{APP_VERSION}</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;