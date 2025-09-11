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
            setIsDataLoading(true);
            try {
                const dataPromises = [
                    api.getCars(),
                    api.getExpenses(),
                    api.getAllUserExpenses(),
                    api.getIncidents(),
                    api.getLocations(),
                ];
                if (user && user.role === 'admin') {
                    dataPromises.push(api.admin.getAllUsers());
                }
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