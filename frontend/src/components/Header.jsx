// autogest-app/frontend/src/components/Header.jsx
import React, { useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, 
    faUser, faCog, faUsersCog, faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const Header = () => {
    const location = useLocation();
    const { user, subscriptionStatus } = useContext(AuthContext);

    const getPageInfo = (pathname) => {
        switch (pathname) {
            case '/': return { title: 'Dashboard', icon: faTachometerAlt };
            case '/cars': return { title: 'Mis Coches', icon: faCar };
            case '/sales': return { title: 'Resumen de Ventas', icon: faChartLine };
            case '/expenses': return { title: 'Gastos', icon: faFileInvoiceDollar };
            case '/profile': return { title: 'Mi Perfil', icon: faUser };
            case '/settings': return { title: 'Ajustes', icon: faCog };
            case '/admin': return { title: 'Gestión', icon: faUsersCog };
            case '/subscription': return { title: 'Suscripción', icon: faCreditCard };
            default: return { title: 'AutoGest', icon: faCar };
        }
    };

    const { title, icon } = getPageInfo(location.pathname);

    const isExempt = user && (user.role === 'admin' || user.role === 'technician');
    const hasValidSubscription = subscriptionStatus === 'active' || 
        (subscriptionStatus === 'cancelled' && user && new Date(user.subscriptionExpiry) > new Date());

    return (
        <header className="bg-component-bg border-b border-border-color p-4 sm:px-6 lg:px-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center">
                <FontAwesomeIcon icon={icon} className="h-6 w-6 text-accent mr-3" />
                <h1 className="text-xl font-bold text-text-primary">{title}</h1>
            </div>

            {user && (
                <Link to="/profile" className="relative">
                    <img 
                        src={user.avatarUrl 
                            ? `${API_BASE_URL}${user.avatarUrl}` 
                            : `https://ui-avatars.com/api/?name=${user.name}&background=B8860B&color=fff&size=128`
                        } 
                        alt="Avatar"
                        className="w-9 h-9 rounded-full object-cover border-2 border-component-bg"
                    />
                    
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    {!isExempt && (
                        <span className={`absolute -bottom-0.5 -right-0.5 block text-white text-[8px] font-bold px-1 py-0 rounded-md border-1 border-component-bg ${hasValidSubscription ? 'bg-accent' : 'bg-text-secondary'}`}>
                            {hasValidSubscription ? 'PRO' : 'FREE'}
                        </span>
                    )}
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                </Link>
            )}
        </header>
    );
};

export default Header;