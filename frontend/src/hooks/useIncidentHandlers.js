// AutoGest/frontend/src/hooks/useIncidentHandlers.js
import api from '../services/api';

export const useIncidentHandlers = (
    { incidents, setIncidents, modalState } // Se modifica la firma para aceptar un objeto
) => {
    const handleAddIncident = async (car, description) => {
        const incidentData = { 
            date: new Date().toISOString().split('T')[0], 
            description, 
            licensePlate: car.licensePlate, 
            carId: car.id 
        };
        try {
            const newIncident = await api.createIncident(incidentData);
            setIncidents(prev => [newIncident, ...prev]);
            modalState.setCarForIncident(null);
        } catch (error) { 
            console.error("Error al añadir incidencia:", error); 
        }
    };

    const handleDeleteIncident = (incidentId) => {
        modalState.setIncidentToDelete(incidents.find(inc => inc.id === incidentId));
    };
    
    const confirmDeleteIncident = async (incidentId) => {
        try {
            await api.deleteIncident(incidentId);
            setIncidents(prev => prev.filter(inc => inc.id !== incidentId));
        } catch (error) { 
            console.error("Error al eliminar incidencia:", error); 
        } finally { 
            modalState.setIncidentToDelete(null); 
        }
    };

    const handleResolveIncident = async (incidentId, newStatus) => {
        try {
            const updatedIncident = await api.updateIncident(incidentId, { status: newStatus });
            setIncidents(prev => prev.map(inc => inc.id === incidentId ? updatedIncident : inc));
        } catch (error) { 
            console.error("Error al resolver incidencia:", error); 
        }
    };

    return {
        handleAddIncident,
        handleDeleteIncident,
        confirmDeleteIncident,
        handleResolveIncident,
    };
};