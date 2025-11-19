// autogest-app/frontend/src/components/NotificationsPanel.jsx
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckDouble, faChevronLeft, faChevronRight, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
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
        className={`flex items-start gap-3 p-3 rounded-lg border border-transparent transition-all ${
            !notification.isRead ? 'bg-red-50 border-red-100' : 'hover:bg-gray-50 hover:border-gray-200'
        } ${(notification.type === 'car_creation_pending_price' || (notification.link && notification.link.includes('/accept-invitation/'))) ? 'cursor-pointer' : ''}`}
    >
        <div
            onClick={() => onClick(notification)}
            className="flex-grow flex items-start gap-3"
        >
            <div className="mt-1 relative">
                 <FontAwesomeIcon icon={faBell} className={`w-4 h-4 ${!notification.isRead ? 'text-accent' : 'text-gray-400'}`} />
                 {!notification.isRead && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full ring-1 ring-white"></span>
                 )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                    {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {timeSince(notification.createdAt)}
                </p>
            </div>
        </div>
        <div className="flex-shrink-0">
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-white"
                title="Eliminar notificación"
            >
                <FontAwesomeIcon icon={faTrashAlt} className="w-3 h-3" />
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
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[70vh] overflow-hidden">
            {/* Header Rojo Occident */}
            <div className="flex-shrink-0 flex justify-between items-center p-4 bg-accent text-white">
                <h3 className="font-bold text-sm uppercase tracking-wide">Notificaciones</h3>
                {onClose && (
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors text-xl leading-none">
                        &times;
                    </button>
                )}
            </div>

            <div className="flex-grow overflow-y-auto p-2 space-y-1">
                {currentNotifications && currentNotifications.length > 0 ? (
                    currentNotifications.map(notif => (
                        <NotificationItem 
                            key={notif.id} 
                            notification={notif} 
                            onClick={handleNotificationClick} 
                            onDelete={handleDeleteNotification} 
                        />
                    ))
                ) : (
                    <div className="text-center py-12 px-4">
                        <FontAwesomeIcon icon={faBell} className="text-3xl text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500">No tienes notificaciones nuevas.</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex-shrink-0 flex justify-between items-center p-2 border-t border-gray-100 bg-white">
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-500 hover:text-accent disabled:opacity-30 transition-colors"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <span className="text-xs font-bold text-gray-400">PÁGINA {currentPage} DE {totalPages}</span>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-500 hover:text-accent disabled:opacity-30 transition-colors"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            )}

            <div className="flex-shrink-0 flex justify-between items-center p-3 border-t border-gray-200 bg-gray-50">
                <Link to="/notifications" onClick={onClose} className="text-xs font-bold text-accent hover:underline uppercase">
                    Ver todas
                </Link>
                <button
                    onClick={onMarkAllRead}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1.5 uppercase"
                >
                    <FontAwesomeIcon icon={faCheckDouble} />
                    Marcar leídas
                </button>
            </div>
        </div>
    );
};

export default NotificationsPanel;