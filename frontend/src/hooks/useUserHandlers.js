// autogest-app/frontend/src/hooks/useUserHandlers.js
import api from '../services/api';

export const useUserHandlers = ({
    users,
    setUsers,
    modalState,
}) => {
    const handleUserAdded = (newUser) => {
        setUsers(prev => [newUser, ...prev]);
        modalState.setAddUserModalOpen(false);
    };

    const handleUserUpdated = (updatedUser) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        modalState.setUserToEdit(null);
    };

    const handleUserDeleted = async (userId) => {
        try {
            await api.admin.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            modalState.setUserToDelete(null);
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            throw error;
        }
    };

    const handleExpelUser = async (userId) => {
        try {
            await api.company.expelUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            // --- INICIO DE LA MODIFICACIÓN ---
            // Se llama a la función a través del objeto modalState
            modalState.setUserToExpel(null);
            // --- FIN DE LA MODIFICACIÓN ---
        } catch (error) {
            console.error("Error al expulsar usuario:", error);
        }
    };

    return {
        handleUserAdded,
        handleUserUpdated,
        handleUserDeleted,
        handleExpelUser,
    };
};