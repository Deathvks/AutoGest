import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckDouble, faChevronLeft, faChevronRight, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `hace ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
    return 'hace unos segundos';
};

const NotificationsPage = ({ cars, setCarToEdit }) => {
    const { notifications, unreadCount, markAllNotificationsAsRead, setPendingInvitationToken, setNotifications, setUnreadCount } = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const handleNotificationClick = (notification) => {
        if (notification.type === 'car_creation_pending_price' && notification.carId && cars && setCarToEdit) {
            const carToEdit = cars.find(c => c.id === notification.carId);
            if (carToEdit) {
                setCarToEdit(carToEdit);
                navigate('/cars');
            }
        } else if (notification.link && notification.link.includes('/accept-invitation/')) {
            const token = notification.link.split('/accept-invitation/')[1];
            if (token) {
                setPendingInvitationToken(token);
            }
        }
    };

    const handleDeleteNotification = async (e, notificationId) => {
        e.stopPropagation();
        
        const sorted = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const currentItemsOnPage = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        const originalNotifications = [...notifications];
        const notificationToDelete = originalNotifications.find(n => n.id === notificationId);
        const newNotifications = originalNotifications.filter(n => n.id !== notificationId);
        
        setNotifications(newNotifications);
        
        if (notificationToDelete && !notificationToDelete.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        if (currentItemsOnPage.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }

        try {
            await api.notifications.delete(notificationId);
        } catch (error) {
            setNotifications(originalNotifications);
            if (notificationToDelete && !notificationToDelete.isRead) {
                setUnreadCount(prev => prev + 1);
            }
        }
    };

    const sortedNotifications = notifications ? [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
    
    const totalPages = Math.ceil(sortedNotifications.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentNotifications = sortedNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Notificaciones</h1>
                    {unreadCount > 0 && (
                        <span className="bg-accent text-white text-sm font-bold rounded-full h-7 w-7 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <button
                    onClick={markAllNotificationsAsRead}
                    className="bg-component-bg backdrop-blur-lg text-text-primary px-4 py-2 flex items-center justify-center rounded-xl hover:bg-component-bg-hover transition-colors border border-border-color shadow-2xl text-sm font-semibold whitespace-nowrap"
                >
                    <FontAwesomeIcon icon={faCheckDouble} className="mr-2" />
                    Marcar todas como leídas
                </button>
            </div>

            {sortedNotifications.length > 0 ? (
                <>
                    <div className="bg-component-bg backdrop-blur-lg rounded-2xl border border-border-color overflow-hidden shadow-2xl">
                        <ul className="divide-y divide-border-color">
                            {currentNotifications.map(notification => (
                                <li 
                                    key={notification.id}
                                    className={`flex items-center gap-4 p-4 sm:p-6 ${!notification.isRead ? 'bg-accent/5' : ''} ${(notification.type === 'car_creation_pending_price' || (notification.link && notification.link.includes('/accept-invitation/'))) ? 'hover:bg-component-bg-hover transition-colors' : ''}`}
                                >
                                    <div 
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`flex-grow flex items-start gap-4 ${(notification.type === 'car_creation_pending_price' || (notification.link && notification.link.includes('/accept-invitation/'))) ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="mt-1">
                                            <FontAwesomeIcon icon={faBell} className={`w-5 h-5 ${notification.isRead ? 'text-text-secondary' : 'text-accent'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm ${notification.isRead ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-text-secondary mt-1">
                                                {timeSince(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                                            className="p-2 text-text-secondary hover:text-red-accent transition-colors"
                                            title="Eliminar notificación"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                     {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-8">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-component-bg-hover text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border-color transition-colors flex items-center gap-2 font-semibold border border-border-color"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                                <span className="hidden sm:inline">Anterior</span>
                            </button>
                            <span className="text-text-secondary font-medium text-sm">Página {currentPage} de {totalPages}</span>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-component-bg-hover text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border-color transition-colors flex items-center gap-2 font-semibold border border-border-color"
                            >
                                <span className="hidden sm:inline">Siguiente</span>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16 px-4 bg-component-bg backdrop-blur-lg rounded-2xl border border-border-color shadow-2xl">
                    <FontAwesomeIcon icon={faBell} className="text-5xl text-text-secondary/50 mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary">No tienes notificaciones</h3>
                    <p className="text-text-secondary mt-2">Cuando tengas notificaciones, aparecerán aquí.</p>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;