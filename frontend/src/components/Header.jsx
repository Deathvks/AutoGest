// autogest-app/frontend/src/components/Header.jsx
import React, { useContext, Fragment, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, 
    faUser, faCog, faUsersCog, faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import { Menu, Transition, Portal } from '@headlessui/react';

const Header = () => {
    const location = useLocation();
    const { user, subscriptionStatus } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <>
            {isMenuOpen && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden" aria-hidden="true" />,
                document.body
            )}
            <header className="sticky top-0 z-40 bg-component-bg backdrop-blur-lg border-b border-border-color p-4 sm:px-6 lg:px-8 flex items-center justify-between lg:hidden">
                <div className="flex items-center">
                    <FontAwesomeIcon icon={icon} className="h-6 w-6 text-accent mr-3" />
                    <h1 className="text-xl font-bold text-text-primary">{title}</h1>
                </div>

                {user && (
                    <Menu as="div" className="relative z-50">
                        {({ open }) => {
                            useEffect(() => {
                                setIsMenuOpen(open);
                            }, [open]);

                            return (
                                <>
                                    <Menu.Button className="relative flex items-center">
                                        <img 
                                            src={user.avatarUrl 
                                                ? user.avatarUrl 
                                                : `https://ui-avatars.com/api/?name=${user.name}&background=8b5cf6&color=fff&size=128`
                                            } 
                                            alt="Avatar"
                                            className="w-9 h-9 rounded-full object-cover ring-2 ring-border-color"
                                        />
                                        {!isExempt && (
                                            <span className={`absolute -bottom-0.5 -right-0.5 block text-white text-[8px] font-bold px-1 py-0 rounded-md border border-component-bg ${hasValidSubscription ? 'bg-accent' : 'bg-gray-700'}`}>
                                                {hasValidSubscription ? 'PRO' : 'FREE'}
                                            </span>
                                        )}
                                    </Menu.Button>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Portal>
                                            <Menu.Items className="absolute right-4 top-20 mt-2 w-48 origin-top-right divide-y divide-border-color rounded-xl bg-component-bg backdrop-blur-lg shadow-2xl ring-1 ring-border-color focus:outline-none z-50">
                                                <div className="px-1 py-1 ">
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <Link to="/profile" className={`${active ? 'bg-component-bg-hover text-text-primary' : 'text-text-secondary'} group flex w-full items-center rounded-lg px-2 py-2 text-sm font-semibold`}>
                                                                <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4" />
                                                                Perfil
                                                            </Link>
                                                        )}
                                                    </Menu.Item>
                                                    {user.role === 'admin' && (
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <Link to="/admin" className={`${active ? 'bg-component-bg-hover text-text-primary' : 'text-text-secondary'} group flex w-full items-center rounded-lg px-2 py-2 text-sm font-semibold`}>
                                                                    <FontAwesomeIcon icon={faUsersCog} className="mr-2 h-4 w-4" />
                                                                    Gestión
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                    )}
                                                    {user.isOwner && user.role !== 'admin' && (
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <Link to="/admin" className={`${active ? 'bg-component-bg-hover text-text-primary' : 'text-text-secondary'} group flex w-full items-center rounded-lg px-2 py-2 text-sm font-semibold`}>
                                                                    <FontAwesomeIcon icon={faUsersCog} className="mr-2 h-4 w-4" />
                                                                    Gestión de Equipo
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                    )}
                                                    {user.role === 'user' && user.companyId && !user.isOwner && user.canExpelUsers && (
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <Link to="/admin" className={`${active ? 'bg-component-bg-hover text-text-primary' : 'text-text-secondary'} group flex w-full items-center rounded-lg px-2 py-2 text-sm font-semibold`}>
                                                                    <FontAwesomeIcon icon={faUsersCog} className="mr-2 h-4 w-4" />
                                                                    Grupo
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                    )}
                                                </div>
                                            </Menu.Items>
                                        </Portal>
                                    </Transition>
                                </>
                            )
                        }}
                    </Menu>
                )}
            </header>
        </>
    );
};

export default Header;