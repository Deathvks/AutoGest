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
            const updatedUser = await api.company.expelUser(userId);
            // Actualizamos el usuario en el estado para reflejar su nuevo rol y la ausencia de companyId
            setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
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
        handleExpelUser, // <-- Se exporta la nueva función
    };
};