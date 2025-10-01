// autogest-app/frontend/src/components/Header.jsx
import React, { useContext, useState, Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, 
    faUser, faCog, faUsersCog, faCreditCard, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';

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

    const rolesExemptFromSubscription = ['admin', 'technician'];
    const isExempt = user && rolesExemptFromSubscription.includes(user.role);

    const hasValidSubscription = subscriptionStatus === 'active' || 
        (subscriptionStatus === 'cancelled' && user && new Date(user.subscriptionExpiry) > new Date());

    return (
        <header className="bg-component-bg border-b border-border-color p-4 sm:px-6 lg:px-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center">
                <FontAwesomeIcon icon={icon} className="h-6 w-6 text-accent mr-3" />
                <h1 className="text-xl font-bold text-text-primary">{title}</h1>
            </div>

            {user && (
                <Menu as="div" className="relative">
                    <div>
                        <Menu.Button className="relative flex items-center">
                            <img 
                                src={user.avatarUrl 
                                    ? user.avatarUrl 
                                    : `https://ui-avatars.com/api/?name=${user.name}&background=B8860B&color=fff&size=128`
                                } 
                                alt="Avatar"
                                className="w-9 h-9 rounded-full object-cover border-2 border-component-bg"
                            />
                            {!isExempt && (
                                <span className={`absolute -bottom-0.5 -right-0.5 block text-white text-[8px] font-bold px-1 py-0 rounded-md border border-component-bg ${hasValidSubscription ? 'bg-accent' : 'bg-text-secondary'}`}>
                                    {hasValidSubscription ? 'PRO' : 'FREE'}
                                </span>
                            )}
                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-border-color rounded-md bg-component-bg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                            <div className="px-1 py-1 ">
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link to="/profile" className={`${active ? 'bg-component-bg-hover text-text-primary' : 'text-text-secondary'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                            <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4" />
                                            Perfil
                                        </Link>
                                    )}
                                </Menu.Item>
                                {user.isOwner && (
                                     <Menu.Item>
                                        {({ active }) => (
                                            <Link to="/admin" className={`${active ? 'bg-component-bg-hover text-text-primary' : 'text-text-secondary'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                                <FontAwesomeIcon icon={faUsersCog} className="mr-2 h-4 w-4" />
                                                Gestión de Equipo
                                            </Link>
                                        )}
                                    </Menu.Item>
                                )}
                                {user.role === 'user' && user.companyId && !user.isOwner && (
                                     <Menu.Item>
                                        {({ active }) => (
                                            <Link to="/admin" className={`${active ? 'bg-component-bg-hover text-text-primary' : 'text-text-secondary'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                                <FontAwesomeIcon icon={faUsersCog} className="mr-2 h-4 w-4" />
                                                Grupo
                                            </Link>
                                        )}
                                    </Menu.Item>
                                )}
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            )}
        </header>
    );
};

export default Header;