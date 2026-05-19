// autogest-app/frontend/src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, faCog,
    faUsersCog, faCreditCard, faSignOutAlt, faLock, faRocket, faBell, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import { APP_VERSION } from '../config/version';

const TrialCountdownSidebar = () => {
    const { trialTimeLeft } = useContext(AuthContext);

    if (!trialTimeLeft) {
        return <span className="block text-xs font-bold mt-1 text-yellow-300">Prueba Expirada</span>;
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

    return <span className="block text-xs font-bold mt-1 text-yellow-200">{timeLeftString}</span>;
};

const Sidebar = ({ onLogoutClick, isOpen, onClose }) => {
    const { user, subscriptionStatus, isTrialActive, unreadCount } = useContext(AuthContext);

    if (!user) return null;

    const hasValidSubscription = subscriptionStatus === 'active' || (subscriptionStatus === 'cancelled' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date());

    const getStatusText = () => {
        if (user.role === 'admin' || hasValidSubscription) return 'Pro';
        if (isTrialActive) return 'Prueba';
        return 'Gratis';
    };

    const userStatusText = getStatusText();

    // Lógica unificada con AppRoutes.jsx
    const canSeeDashboard =
        ['admin', 'technician', 'technician_subscribed'].includes(user.role) ||
        hasValidSubscription ||
        isTrialActive;

    const NavItem = ({ to, icon, children, locked = false, count }) => {
        const baseClasses = "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 group";

        if (locked) {
            return (
                <div
                    className={`${baseClasses} text-gray-500 opacity-60 cursor-not-allowed relative bg-white/5`}
                    title="Suscríbete para obtener todas las ventajas"
                >
                    <FontAwesomeIcon icon={icon} className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="flex-1">{children}</span>
                    <FontAwesomeIcon icon={faLock} className="w-3 h-3 ml-auto text-gray-600" />
                </div>
            );
        }

        return (
            <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                    `${baseClasses} ${isActive
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        <FontAwesomeIcon
                            icon={icon}
                            className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
                        />
                        <span className="flex-1">{children}</span>
                        {count > 0 && (
                            <span className={`text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto ${isActive ? 'bg-white text-[#020B1C]' : 'bg-white/20 text-white'}`}>
                                {count}
                            </span>
                        )}
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <div className={`
                fixed lg:sticky top-0 left-0 h-dvh z-50 lg:z-20 
                w-64 bg-accent text-white flex flex-col flex-shrink-0
                border-r border-white/10 shadow-2xl lg:shadow-sm
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
            `}>
                <div className="h-16 flex items-center justify-between lg:justify-center px-6 border-b border-white/10 flex-shrink-0">
                    <Link to="/" onClick={onClose} className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        AutoGest
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-white p-2 -mr-2 focus:outline-none transition-colors"
                        aria-label="Cerrar menú"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto no-scrollbar">
                    {canSeeDashboard && (
                        <NavItem to="/" icon={faTachometerAlt}>Dashboard</NavItem>
                    )}
                    <NavItem to="/cars" icon={faCar}>Mis Coches</NavItem>
                    <NavItem to="/sales" icon={faChartLine}>Ventas</NavItem>
                    <NavItem to="/expenses" icon={faFileInvoiceDollar}>Gastos</NavItem>

                    <div className="my-4 border-t border-white/10 mx-2"></div>

                    <NavItem to="/notifications" icon={faBell} count={unreadCount}>Notificaciones</NavItem>

                    {user.role === 'admin' && (
                        <NavItem to="/admin" icon={faUsersCog}>
                            Administración
                        </NavItem>
                    )}

                    <NavItem to="/subscription" icon={faCreditCard}>Suscripción</NavItem>
                </nav>

                {isTrialActive && !hasValidSubscription && (
                    <div className="px-4 pb-4 flex-shrink-0">
                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-100 shadow-sm">
                            <div className="flex items-start gap-3">
                                <FontAwesomeIcon icon={faRocket} className="h-5 w-5 mt-0.5 text-yellow-400" />
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-yellow-300">Prueba Activa</div>
                                    <TrialCountdownSidebar />
                                    <Link to="/subscription" onClick={onClose} className="text-xs font-semibold underline mt-1 block hover:text-yellow-300 text-yellow-400">
                                        Suscribirse
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-4 border-t border-white/10 flex-shrink-0">
                    <Link
                        to="/profile"
                        onClick={onClose}
                        className="hidden lg:flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-white/10 transition-all border border-transparent hover:border-white/20 group"
                    >
                        <img
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=020B1C&color=fff`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/20 group-hover:border-white/50 transition-colors"
                        />
                        <div className="min-w-0 overflow-hidden text-left">
                            <p className="text-sm font-bold text-white truncate group-hover:text-gray-200 transition-colors">{user.name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-400 truncate">
                                <span className={`inline-block w-2 h-2 flex-shrink-0 rounded-full ${userStatusText === 'Pro' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                <span className="truncate">{userStatusText}</span>
                            </div>
                        </div>
                    </Link>

                    <div className="space-y-1">
                        <Link
                            to="/settings"
                            onClick={onClose}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-white/10 hover:text-white transition-all border border-transparent hover:border-white/10"
                        >
                            <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-3" />
                            Ajustes
                        </Link>

                        <button
                            onClick={() => {
                                onClose();
                                onLogoutClick();
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-white/10 hover:text-red-400 transition-all border border-transparent hover:border-white/10"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3 text-red-500" />
                            Cerrar Sesión
                        </button>
                    </div>
                    <div className="text-center mt-4">
                        <span className="text-[10px] text-gray-500 font-mono">v{APP_VERSION}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;