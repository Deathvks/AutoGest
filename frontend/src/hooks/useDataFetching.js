// AutoGest/frontend/src/hooks/useDataFetching.js
import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const useDataFetching = () => {
    const { user } = useContext(AuthContext);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [cars, setCars] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [locations, setLocations] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setIsDataLoading(false);
                return;
            };

            setIsDataLoading(true);
            try {
                const dataPromises = [
                    api.getCars(),
                    api.getExpenses(),
                    api.getAllUserExpenses(),
                    api.getIncidents(),
                    api.getLocations(),
                ];
                
                // --- INICIO DE LA MODIFICACIÓN ---
                // Se pide la lista de usuarios para roles de gestión O si el usuario tiene permiso para expulsar.
                if (user.role === 'admin' || user.role === 'technician' || user.role === 'technician_subscribed' || user.canExpelUsers) {
                    dataPromises.push(api.admin.getAllUsers());
                } else {
                    // Para un usuario normal sin permisos, la lista de "usuarios" es solo él mismo.
                    dataPromises.push(Promise.resolve([user]));
                }
                // --- FIN DE LA MODIFICACIÓN ---

                const [carsData, expensesData, allExpensesData, incidentsData, locationsData, usersData] = await Promise.all(dataPromises);
                
                setCars(carsData);
                setExpenses(expensesData);
                setAllExpenses(allExpensesData);
                setIncidents(incidentsData);
                setLocations(locationsData);
                if (usersData) setUsers(usersData);

            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setIsDataLoading(false);
            }
        };
        fetchData();
    }, [user]);

    return {
        isDataLoading,
        cars, setCars,
        expenses, setExpenses,
        allExpenses, setAllExpenses,
        incidents, setIncidents,
        locations, setLocations,
        users, setUsers,
    };
};