// autogest-app/frontend/src/hooks/useDataFetching.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useDataFetching = () => {
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
            const [
                carsData,
                allExpensesData,
                incidentsData,
                locationsData,
                usersData,
                notificationsData,
            ] = await Promise.all([
                fetchData('cars', api.getCars),
                fetchData('expenses', api.getAllUserExpenses),
                fetchData('incidents', api.getIncidents),
                fetchData('locations', api.getLocations),
                fetchData('users', api.admin.getAllUsers),
                fetchData('notifications', api.notifications.getAll),
            ]);
    
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
    }, [fetchData]);

    useEffect(() => {
        fetchAllInitialData();
    }, [fetchAllInitialData]);

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
            users: async () => setUsers(await fetchData('users', api.admin.getAllUsers)),
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
    }, [fetchData, fetchDashboardStats, fetchActivity, fetchAllInitialData]);

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