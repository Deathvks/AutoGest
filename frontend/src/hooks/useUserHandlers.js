// AutoGest/frontend/src/hooks/useUserHandlers.js
import api from '../services/api';

export const useUserHandlers = (
    setUsers,
    modalState
) => {
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
        }
    };

    // --- INICIO DE LA MODIFICACIÓN ---
    const handleExpelUser = async (userId) => {
        try {
            await api.company.expelUser(userId);
            // Se filtra el usuario expulsado de la lista local para que desaparezca de la UI.
            setUsers(prev => prev.filter(u => u.id !== userId));
            modalState.setUserToExpel(null);
        } catch (error) {
            console.error("Error al expulsar usuario:", error);
        }
    };
    // --- FIN DE LA MODIFICACIÓN ---

    return {
        handleUserAdded,
        handleUserUpdated,
        handleUserDeleted,
        handleExpelUser,
    };
};