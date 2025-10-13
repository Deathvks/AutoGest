// frontend/src/pages/NotificationsPage.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

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
    const { notifications, unreadCount, markAllNotificationsAsRead } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- INICIO DE LA MODIFICACIÓN ---
    const handleNotificationClick = (notification) => {
        if (notification.type === 'car_creation_pending_price' && notification.carId && cars && setCarToEdit) {
            const carToEdit = cars.find(c => c.id === notification.carId);
            if (carToEdit) {
                setCarToEdit(carToEdit);
                navigate('/cars');
            } else {
                console.warn(`Coche con id ${notification.carId} no encontrado.`);
            }
        }
    };
    // --- FIN DE LA MODIFICACIÓN ---

    const sortedNotifications = notifications ? [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

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
                <div className="bg-component-bg backdrop-blur-lg rounded-2xl border border-border-color overflow-hidden shadow-2xl">
                    <ul className="divide-y divide-border-color">
                        {sortedNotifications.map(notification => (
                            // --- INICIO DE LA MODIFICACIÓN ---
                            <li 
                                key={notification.id} 
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 sm:p-6 ${!notification.isRead ? 'bg-accent/5' : ''} ${notification.type === 'car_creation_pending_price' ? 'cursor-pointer hover:bg-component-bg-hover transition-colors' : ''}`}
                            >
                            {/* --- FIN DE LA MODIFICACIÓN --- */}
                                <div className="flex items-start gap-4">
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
                            </li>
                        ))}
                    </ul>
                </div>
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