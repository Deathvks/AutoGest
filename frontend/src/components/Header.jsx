// frontend/src/components/Header.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, 
    faUser, faCog, faUsersCog
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    const location = useLocation();

    const getPageInfo = (pathname) => {
        switch (pathname) {
            case '/':
                return { title: 'Dashboard', icon: faTachometerAlt };
            case '/cars':
                return { title: 'Mis Coches', icon: faCar };
            case '/sales':
                return { title: 'Resumen de Ventas', icon: faChartLine };
            case '/expenses':
                return { title: 'Gastos', icon: faFileInvoiceDollar };
            case '/profile':
                return { title: 'Mi Perfil', icon: faUser };
            case '/settings':
                return { title: 'Configuración', icon: faCog };
            case '/admin':
                return { title: 'Gestión de Usuarios', icon: faUsersCog };
            default:
                return { title: 'AutoGest', icon: faCar };
        }
    };

    const { title, icon } = getPageInfo(location.pathname);

    return (
        <header className="bg-component-bg border-b border-border-color p-4 sm:px-6 lg:px-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center">
                <FontAwesomeIcon icon={icon} className="h-6 w-6 text-accent mr-3" />
                <h1 className="text-xl font-bold text-text-primary">{title}</h1>
            </div>
            {/* Aquí se podrían añadir elementos como un buscador, notificaciones o el perfil del usuario */}
        </header>
    );
};

export default Header;