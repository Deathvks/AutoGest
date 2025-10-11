// autogest-app/frontend/src/hooks/useDataFetching.js
import { useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const useDataFetching = () => {
    const { user } = useContext(AuthContext); // Importamos el usuario del contexto
    const [cars, setCars] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [locations, setLocations] = useState([]);
    const [users, setUsers] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [activity, setActivity] = useState({ entries: [], total: 0 });
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [loading, setLoading] = useState({
        cars: true,
        expenses: true,
        incidents: true,
        locations: true,
        users: true,
        dashboard: true,
        activity: true,
        notifications: true,
    });

    const [error, setError] = useState({
        cars: null,
        expenses: null,
        incidents: null,
        locations: null,
        users: null,
        dashboard: null,
        activity: null,
        notifications: null,
    });

    const fetchData = useCallback(async (dataType, apiCall, ...args) => {
        setLoading(prev => ({ ...prev, [dataType]: true }));
        setError(prev => ({ ...prev, [dataType]: null }));
        try {
            const data = await apiCall(...args);
            return data;
        } catch (err) {
            console.error(`Error fetching ${dataType}:`, err);
            setError(prev => ({ ...prev, [dataType]: err.message || `Error al cargar ${dataType}.` }));
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, [dataType]: false }));
        }
    }, []);
    
    const fetchAllInitialData = useCallback(async () => {
        try {
            // --- INICIO DE LA MODIFICACIÓN ---
            const promises = [
                fetchData('cars', api.getCars),
                fetchData('expenses', api.getAllUserExpenses),
                fetchData('incidents', api.getIncidents),
                fetchData('locations', api.getLocations),
                fetchData('notifications', api.notifications.getAll),
            ];

            // Solo añadimos la petición de usuarios si el rol es el adecuado
            if (user && (user.role === 'admin' || user.role === 'technician' || user.role === 'technician_subscribed' || user.canExpelUsers)) {
                promises.push(fetchData('users', api.admin.getAllUsers));
            } else {
                setLoading(prev => ({ ...prev, users: false })); // Marcamos la carga de usuarios como finalizada
                setUsers([]); // Nos aseguramos de que no haya datos de usuarios anteriores
            }

            const [
                carsData,
                allExpensesData,
                incidentsData,
                locationsData,
                notificationsData,
                usersData, // Puede ser undefined si no se pidió
            ] = await Promise.all(promises);
            // --- FIN DE LA MODIFICACIÓN ---
    
            setCars(carsData || []);
            setAllExpenses(allExpensesData || []);
            setExpenses((allExpensesData || []).filter(e => !e.carLicensePlate));
            setIncidents(incidentsData || []);
            setLocations(locationsData || []);
            setUsers(usersData || []);
            setNotifications(notificationsData || []);
            setUnreadCount((notificationsData || []).filter(n => !n.isRead).length);
        } catch (err) {
            console.error("Error fetching initial data pack:", err);
        }
    }, [fetchData, user]); // Añadimos user a las dependencias

    useEffect(() => {
        if (user) { // Nos aseguramos de que el usuario exista antes de cargar datos
            fetchAllInitialData();
        }
    }, [fetchAllInitialData, user]); // Añadimos user a las dependencias

    const markAllNotificationsAsRead = useCallback(async () => {
        const originalNotifications = notifications;
        const newUnreadCount = 0;

        setNotifications(current => current.map(n => ({ ...n, isRead: true })));
        setUnreadCount(newUnreadCount);
        
        try {
            await api.notifications.markAllAsRead();
        } catch (err) {
            console.error('Error marking notifications as read:', err);
            setNotifications(originalNotifications);
            setUnreadCount(originalNotifications.filter(n => !n.isRead).length);
        }
    }, [notifications]);

    const fetchDashboardStats = useCallback(async (startDate, endDate) => {
        try {
            const stats = await fetchData('dashboard', api.dashboard.getStats, startDate, endDate);
            setDashboardStats(stats);
        } catch (e) {
            // El error ya se maneja en fetchData
        }
    }, [fetchData]);
    
    const fetchActivity = useCallback(async (page = 1) => {
        try {
            const activityData = await fetchData('activity', api.dashboard.getActivity, page);
            setActivity(activityData);
        } catch (e) {
            // el error ya está manejado en fetchData
        }
    }, [fetchData]);

    const refreshData = useCallback(async (dataType) => {
        const refreshMap = {
            cars: async () => setCars(await fetchData('cars', api.getCars)),
            expenses: async () => {
                const all = await fetchData('expenses', api.getAllUserExpenses);
                setAllExpenses(all || []);
                setExpenses((all || []).filter(e => !e.carLicensePlate));
            },
            incidents: async () => setIncidents(await fetchData('incidents', api.getIncidents)),
            locations: async () => setLocations(await fetchData('locations', api.getLocations)),
            users: async () => {
                if (user && (user.role === 'admin' || user.role === 'technician' || user.role === 'technician_subscribed' || user.canExpelUsers)) {
                    setUsers(await fetchData('users', api.admin.getAllUsers));
                }
            },
            dashboard: fetchDashboardStats,
            activity: fetchActivity,
            notifications: fetchAllInitialData, // Refresca todo para consistencia
        };
        if (refreshMap[dataType]) {
            try {
                await refreshMap[dataType]();
            } catch (e) {
                console.error(`Failed to refresh ${dataType}:`, e);
            }
        }
    }, [fetchData, fetchDashboardStats, fetchActivity, fetchAllInitialData, user]);

    const isDataLoading = loading.cars || loading.expenses || loading.incidents || loading.locations || loading.users;

    return {
        isDataLoading,
        cars, setCars,
        expenses, setExpenses,
        allExpenses, setAllExpenses,
        incidents, setIncidents,
        locations, setLocations,
        users, setUsers,
        dashboardStats,
        activity,
        notifications,
        unreadCount,
        loading,
        error,
        refreshData,
        fetchDashboardStats,
        fetchActivity,
        markAllNotificationsAsRead,
    };
};