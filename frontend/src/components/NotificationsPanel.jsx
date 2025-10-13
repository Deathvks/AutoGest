import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheckDouble, faChevronLeft, faChevronRight, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `hace ${Math.floor(interval)}a`;
    interval = seconds / 2592000;
    if (interval > 1) return `hace ${Math.floor(interval)}m`;
    interval = seconds / 86400;
    if (interval > 1) return `hace ${Math.floor(interval)}d`;
    interval = seconds / 3600;
    if (interval > 1) return `hace ${Math.floor(interval)}h`;
    interval = seconds / 60;
    if (interval > 1) return `hace ${Math.floor(interval)}m`;
    return `${Math.floor(seconds)}s`;
};

const NotificationItem = ({ notification, onClick, onDelete }) => (
    <div 
        className={`flex items-center gap-4 p-3 rounded-lg ${!notification.isRead ? 'bg-accent/5' : ''} ${(notification.type === 'car_creation_pending_price' || (notification.link && notification.link.includes('/accept-invitation/'))) ? 'hover:bg-component-bg-hover transition-colors' : ''}`}
    >
        <div
            onClick={() => onClick(notification)}
            className={`flex-grow flex items-start gap-4 ${(notification.type === 'car_creation_pending_price' || (notification.link && notification.link.includes('/accept-invitation/'))) ? 'cursor-pointer' : ''}`}
        >
            <div className="relative mt-1">
                <FontAwesomeIcon icon={faBell} className="text-text-secondary" />
                {!notification.isRead && (
                    <FontAwesomeIcon icon={faCircle} className="absolute -top-1 -right-1 text-accent w-2 h-2" />
                )}
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
                onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                className="p-2 text-text-secondary hover:text-red-accent transition-colors"
                title="Eliminar notificación"
            >
                <FontAwesomeIcon icon={faTrashAlt} />
            </button>
        </div>
    </div>
);

const NotificationsPanel = ({ onMarkAllRead, onClose, cars, setCarToEdit }) => {
    const { notifications, setNotifications, setUnreadCount, setPendingInvitationToken } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const navigate = useNavigate();

    const handleNotificationClick = (notification) => {
        if (notification.type === 'car_creation_pending_price' && notification.carId && cars && setCarToEdit) {
            const carToEdit = cars.find(c => c.id === notification.carId);
            if (carToEdit) {
                setCarToEdit(carToEdit);
                onClose(); 
                navigate('/cars');
            }
        } else if (notification.link && notification.link.includes('/accept-invitation/')) {
            const token = notification.link.split('/accept-invitation/')[1];
            if (token) {
                setPendingInvitationToken(token);
                onClose();
            }
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        const originalNotifications = [...notifications];
        const notificationToDelete = originalNotifications.find(n => n.id === notificationId);

        const newNotifications = originalNotifications.filter(n => n.id !== notificationId);
        setNotifications(newNotifications);
        
        if (notificationToDelete && !notificationToDelete.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
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
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentNotifications = sortedNotifications.slice(startIndex, endIndex);

    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full border border-border-color flex flex-col max-h-[70vh]">
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                <h3 className="font-bold text-text-primary text-lg">Notificaciones</h3>
                {onClose && (
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl leading-none">&times;</button>
                )}
            </div>

            <div className="flex-grow overflow-y-auto p-2 no-scrollbar">
                {currentNotifications && currentNotifications.length > 0 ? (
                    <div className="space-y-1">
                        {currentNotifications.map(notif => (
                            <NotificationItem 
                                key={notif.id} 
                                notification={notif} 
                                onClick={handleNotificationClick} 
                                onDelete={handleDeleteNotification} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4">
                        <FontAwesomeIcon icon={faBell} className="text-4xl text-text-secondary/50 mb-4" />
                        <p className="text-sm text-text-secondary">No tienes notificaciones nuevas.</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex-shrink-0 flex justify-between items-center p-2 border-t border-border-color">
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg bg-component-bg-hover disabled:opacity-50 hover:bg-border-color transition-colors"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <span className="text-xs font-semibold text-text-secondary">PÁGINA {currentPage} DE {totalPages}</span>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg bg-component-bg-hover disabled:opacity-50 hover:bg-border-color transition-colors"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            )}

            <div className="flex-shrink-0 flex justify-between items-center p-3 border-t border-border-color bg-component-bg-hover/50 rounded-b-2xl">
                <Link to="/notifications" onClick={onClose} className="text-xs font-semibold text-accent hover:underline">
                    Ver todas
                </Link>
                <button
                    onClick={onMarkAllRead}
                    className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5"
                >
                    <FontAwesomeIcon icon={faCheckDouble} />
                    Marcar todas como leídas
                </button>
            </div>
        </div>
    );
};

export default NotificationsPanel;