// autogest-app/frontend/src/hooks/useDataFetching.js
import { useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const useDataFetching = () => {
    const { user, fetchNotifications, setNotifications, setUnreadCount, markAllNotificationsAsRead } = useContext(AuthContext);
    const [cars, setCars] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [locations, setLocations] = useState([]);
    const [users, setUsers] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [activity, setActivity] = useState({ entries: [], total: 0 });

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

    useEffect(() => {
        if (user) {
            const interval = setInterval(() => {
                fetchNotifications();
            }, 30000); 

            return () => clearInterval(interval);
        }
    }, [user, fetchNotifications]);

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
            const promises = [
                fetchData('cars', api.getCars),
                fetchData('expenses', api.getAllUserExpenses),
                fetchData('incidents', api.getIncidents),
                fetchData('locations', api.getLocations),
                fetchData('notifications', api.notifications.getAll),
            ];

            if (user && (user.role === 'admin' || user.role === 'technician' || user.role === 'technician_subscribed' || user.canExpelUsers)) {
                promises.push(fetchData('users', api.admin.getAllUsers));
            } else {
                setLoading(prev => ({ ...prev, users: false }));
                setUsers([]);
            }

            const [
                carsData,
                allExpensesData,
                incidentsData,
                locationsData,
                notificationsData,
                usersData,
            ] = await Promise.all(promises);
    
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
    }, [fetchData, user, setNotifications, setUnreadCount]);

    useEffect(() => {
        if (user) {
            fetchAllInitialData();
        }
    }, [fetchAllInitialData, user]);

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se elimina la función markAllNotificationsAsRead de este hook, ya que ahora se gestiona en AuthContext
    // --- FIN DE LA MODIFICACIÓN ---

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
            notifications: fetchAllInitialData,
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
        loading,
        error,
        refreshData,
        fetchDashboardStats,
        fetchActivity,
        markAllNotificationsAsRead, // <-- Se mantiene la exportación para que los componentes que lo usan sigan funcionando
    };
};