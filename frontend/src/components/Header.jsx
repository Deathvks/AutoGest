// autogest-app/frontend/src/components/Header.jsx
import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar, 
    faUser, faCog, faUsersCog, faCreditCard, faBell
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import { Menu, Transition, Portal } from '@headlessui/react';
import NotificationsPanel from './NotificationsPanel';

// --- INICIO DE LA MODIFICACIÓN ---
const Header = ({ appState }) => {
    const { cars, setCarToEdit } = appState;
    // --- FIN DE LA MODIFICACIÓN ---
    const location = useLocation();
    const { user, subscriptionStatus, notifications, unreadCount, markAllNotificationsAsRead } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationsButtonRef = useRef(null);
    const notificationsPanelRef = useRef(null);

    // Click outside handler para cerrar el panel de notificaciones
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationsButtonRef.current && !notificationsButtonRef.current.contains(event.target) &&
                notificationsPanelRef.current && !notificationsPanelRef.current.contains(event.target)
            ) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationsToggle = () => {
        const currentlyOpening = !isNotificationsOpen;
        setIsNotificationsOpen(currentlyOpening);
        if (currentlyOpening && unreadCount > 0) {
            markAllNotificationsAsRead();
        }
    };

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
            case '/notifications': return { title: 'Notificaciones', icon: faBell };
            default: return { title: 'AutoGest', icon: faCar };
        }
    };

    const { title, icon } = getPageInfo(location.pathname);

    if (!user) {
        return null;
    }

    const rolesExemptFromSubscription = ['admin', 'technician'];
    const isExempt = rolesExemptFromSubscription.includes(user.role);

    const hasValidSubscription = subscriptionStatus === 'active' || 
        (subscriptionStatus === 'cancelled' && new Date(user.subscriptionExpiry) > new Date());

    return (
        <>
            {(isMenuOpen || isNotificationsOpen) && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" aria-hidden="true" />,
                document.body
            )}
            <header className="sticky top-0 z-50 bg-component-bg backdrop-blur-lg border-b border-border-color p-4 sm:px-6 lg:px-8 flex items-center justify-between lg:hidden">
                <div className="flex items-center">
                    <FontAwesomeIcon icon={icon} className="h-6 w-6 text-accent mr-3" />
                    <h1 className="text-xl font-bold text-text-primary">{title}</h1>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div>
                        <button
                            ref={notificationsButtonRef}
                            onClick={handleNotificationsToggle}
                            className="relative w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Notificaciones"
                        >
                            <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-component-bg" />
                            )}
                        </button>
                    </div>

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
                </div>
            </header>

            {isNotificationsOpen && createPortal(
                <div
                    ref={notificationsPanelRef}
                    className="fixed left-1/2 -translate-x-1/2 w-[90vw] sm:w-[70vw] max-w-md top-20 z-[60] animate-fade-in-down"
                >
                    <NotificationsPanel
                        notifications={notifications}
                        onMarkAllRead={markAllNotificationsAsRead}
                        onClose={() => setIsNotificationsOpen(false)}
                        cars={cars}
                        setCarToEdit={setCarToEdit}
                    />
                </div>,
                document.body
            )}
        </>
    );
};

export default Header;