// autogest-app/frontend/src/pages/NotificationsPage.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckDouble, faChevronLeft, faChevronRight, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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

    const handleNotificationClick = async (notification) => {
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
        } else if (notification.message === "Tu pago de suscripción se ha procesado con éxito.") {
            try {
                const loadingToast = toast.loading('Descargando factura...');
                const blob = await api.subscriptions.downloadLatestInvoice();
                
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Factura_Suscripcion_${new Date().toISOString().split('T')[0]}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                
                toast.dismiss(loadingToast);
                toast.success('Factura descargada correctamente');
            } catch (error) {
                toast.dismiss();
                console.error("Error al descargar la factura:", error);
                toast.error('No se pudo descargar la factura.');
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

    const isClickable = (notification) => {
        return (
            notification.type === 'car_creation_pending_price' || 
            (notification.link && notification.link.includes('/accept-invitation/')) ||
            notification.message === "Tu pago de suscripción se ha procesado con éxito."
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Notificaciones</h1>
                    {unreadCount > 0 && (
                        <span className="bg-accent text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <button
                    onClick={markAllNotificationsAsRead}
                    className="bg-white text-gray-700 px-4 py-2 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm text-sm font-bold uppercase"
                >
                    <FontAwesomeIcon icon={faCheckDouble} className="mr-2 text-accent" />
                    Marcar todas leídas
                </button>
            </div>

            {sortedNotifications.length > 0 ? (
                <>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <ul className="divide-y divide-gray-100">
                            {currentNotifications.map(notification => (
                                <li 
                                    key={notification.id}
                                    className={`flex items-center gap-4 p-4 sm:p-5 transition-colors ${
                                        !notification.isRead ? 'bg-red-50' : 'bg-white hover:bg-gray-50'
                                    } ${isClickable(notification) ? 'cursor-pointer' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="mt-1">
                                        <FontAwesomeIcon icon={faBell} className={`w-5 h-5 ${!notification.isRead ? 'text-accent' : 'text-gray-400'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${!notification.isRead ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {timeSince(notification.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-gray-100/50"
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
                                className="px-4 py-2 rounded-lg bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 font-bold text-sm border border-gray-300 shadow-sm"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                                <span className="hidden sm:inline">Anterior</span>
                            </button>
                            <span className="text-gray-500 font-medium text-sm">Página {currentPage} de {totalPages}</span>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 font-bold text-sm border border-gray-300 shadow-sm"
                            >
                                <span className="hidden sm:inline">Siguiente</span>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 px-4 bg-white rounded-lg border border-gray-200 border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        <FontAwesomeIcon icon={faBell} className="text-3xl text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No tienes notificaciones</h3>
                    <p className="text-gray-500 mt-2">Te avisaremos cuando ocurra algo importante.</p>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;