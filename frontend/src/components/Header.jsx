// autogest-app/frontend/src/components/Header.jsx
import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt, faCar, faChartLine, faFileInvoiceDollar,
    faUser, faCog, faUsersCog, faCreditCard, faBell, faBars
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import { Menu, Transition, Portal } from '@headlessui/react';
import NotificationsPanel from './NotificationsPanel';

const Header = ({ appState, onMenuToggle }) => {
    const { cars, setCarToEdit } = appState;
    const location = useLocation();
    const { user, subscriptionStatus, notifications, unreadCount, markAllNotificationsAsRead } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationsButtonRef = useRef(null);
    const notificationsPanelRef = useRef(null);

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

    const hasValidSubscription = subscriptionStatus === 'active' || (subscriptionStatus === 'cancelled' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date());
    const isTrialing = user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date() && !hasValidSubscription;

    const getStatusInfo = () => {
        if (user.role === 'admin' || hasValidSubscription) {
            return { text: 'Pro', badgeClass: 'bg-green-500 text-white' };
        }
        if (isTrialing) {
            return { text: 'Prueba', badgeClass: 'bg-yellow-500 text-white' };
        }
        return { text: 'Free', badgeClass: 'bg-gray-500 text-white' };
    };
    const statusInfo = getStatusInfo();

    return (
        <>
            {(isMenuOpen || isNotificationsOpen) && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" aria-hidden="true" />,
                document.body
            )}

            <header className="sticky top-0 z-50 bg-[#020B1C] text-white shadow-md pb-4 px-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8 flex items-center justify-between lg:hidden">
                <div className="flex items-center">
                    {/* --- BOTÓN HAMBURGUESA CENTRADO --- */}
                    <button
                        onClick={onMenuToggle}
                        className="w-10 h-10 flex items-center justify-center text-white focus:outline-none hover:bg-white/20 -ml-2 mr-1 rounded-md transition-colors"
                        aria-label="Abrir menú"
                    >
                        <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
                    </button>

                    {/* Icono de la página (oculto en móviles muy pequeños para dar espacio, visible en sm) */}
                    <FontAwesomeIcon icon={icon} className="h-5 w-5 mr-2 text-white hidden sm:block" />

                    {/* Título con corrección óptica de altura (translate-y) */}
                    <h1 className="text-xl font-bold tracking-tight leading-none translate-y-[1px]">{title}</h1>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-4">
                    <div>
                        <button
                            ref={notificationsButtonRef}
                            onClick={handleNotificationsToggle}
                            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white focus:outline-none"
                            aria-label="Notificaciones"
                        >
                            <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-[#ED123A] ring-2 ring-[#020B1C]" />
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
                                    <Menu.Button className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 transition-colors focus:outline-none">
                                        <img
                                            src={user.avatarUrl
                                                ? user.avatarUrl
                                                : `https://ui-avatars.com/api/?name=${user.name}&background=ffffff&color=020B1C&size=128`
                                            }
                                            alt="Avatar"
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                                        />
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
                                            <Menu.Items className="absolute right-4 top-20 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-[14px] bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                                <div className="px-4 py-3">
                                                    <p className="text-sm text-gray-500">Conectado como</p>
                                                    <p className="truncate text-sm font-bold text-[#020B1C]">{user.email}</p>
                                                    <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.badgeClass}`}>
                                                        {statusInfo.text.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="px-1 py-1">
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <Link to="/profile" className={`${active ? 'bg-gray-50' : ''} text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                                                <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4 text-[#020B1C]" />
                                                                Mi Perfil
                                                            </Link>
                                                        )}
                                                    </Menu.Item>
                                                    {user.role === 'admin' && (
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <Link to="/admin" className={`${active ? 'bg-gray-50' : ''} text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                                                    <FontAwesomeIcon icon={faUsersCog} className="mr-2 h-4 w-4 text-[#020B1C]" />
                                                                    Gestión Global
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
                    className="fixed left-1/2 -translate-x-1/2 w-[95vw] max-w-md top-20 z-[60] animate-fade-in-down"
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