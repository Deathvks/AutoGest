// autogest-app/frontend/src/components/Sidebar.jsx
import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, faCog, 
    faUsersCog, faCreditCard, faSignOutAlt, faLock, faRocket
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import { APP_VERSION } from '../config/version'; 

const TrialCountdownSidebar = ({ expiryDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryDate) - +new Date();
        if (difference <= 0) return 'Prueba Expirada';

        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const m = Math.floor((difference / 1000 / 60) % 60);

        if (d > 0) return `Quedan: ${d}d ${h}h`;
        if (h > 0) return `Quedan: ${h}h ${m}m`;
        return `Quedan: ${m}m`;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Se actualiza cada minuto

        return () => clearInterval(timer);
    });

    return <span className="block text-xs font-bold">{timeLeft}</span>;
};

const Sidebar = ({ onLogoutClick }) => {
    const { user, subscriptionStatus } = useContext(AuthContext);

    if (!user) return null;

    const isExempt = user.role === 'admin' || user.role === 'technician';
    const hasValidSubscription = subscriptionStatus === 'active' || (subscriptionStatus === 'cancelled' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date());
    const isTrialing = user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date() && !hasValidSubscription;

    const getStatusText = () => {
        if (isExempt || hasValidSubscription) return 'Pro';
        if (isTrialing) return 'Prueba';
        return 'Free';
    };

    const userStatusText = getStatusText();
    
    // --- INICIO DE LA MODIFICACIÓN ---
    // La variable isSubscribed se recupera aquí para la lógica de bloqueo.
    const isSubscribed = subscriptionStatus === 'active';
    const isManagementLocked = isTrialing && !isSubscribed && user.role !== 'admin';
    // --- FIN DE LA MODIFICACIÓN ---

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

                <NavItem to="/subscription" icon={faCreditCard}>Suscripción</NavItem>
            </nav>

            {isTrialing && user.subscriptionStatus === 'inactive' && (
                <div className="px-4 pb-4">
                    <div className="p-4 rounded-lg bg-accent/10 text-accent">
                        <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faRocket} className="h-5 w-5" />
                            <div className="flex-1">
                                <div className="font-bold text-sm">Prueba Gratuita</div>
                                <TrialCountdownSidebar expiryDate={user.trialExpiresAt} />
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
                            <p className="text-xs text-text-secondary capitalize truncate">{userStatusText}</p>
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