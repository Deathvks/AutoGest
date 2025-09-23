// autogest-app/frontend/src/pages/ManageUsersPage.jsx
import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faEdit, faTrash, faUserShield, faUser, faEnvelope, faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

const ManageUsersPage = ({ users, onAddUser, onEditUser, onDeleteUser }) => {
    const { user: currentUser } = useContext(AuthContext);

    const RoleBadge = ({ role }) => {
        // --- INICIO DE LA MODIFICACIÓN ---
        const roleStyles = {
            admin: 'bg-red-accent/10 text-red-accent',
            user: 'bg-blue-accent/10 text-blue-accent',
            technician: 'bg-green-accent/10 text-green-accent', // <-- Estilo añadido
        };
        // --- FIN DE LA MODIFICACIÓN ---
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${roleStyles[role] || 'bg-zinc-200'}`}>
                {role}
            </span>
        );
    };

    return (
        <div>
            {/* --- CABECERA --- */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Admin</h1>
                <div className="flex gap-4">
                    <button
                        onClick={onAddUser}
                        className="bg-blue-accent text-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                        title="Añadir nuevo usuario"
                    >
                        <FontAwesomeIcon icon={faPlusCircle} className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {users.length > 0 ? (
                <>
                    {/* --- VISTA DE TARJETAS PARA MÓVIL --- */}
                    <div className="space-y-4 md:hidden">
                        {users.map(user => (
                            <div key={user.id} className="bg-component-bg rounded-xl border border-border-color p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-text-primary flex items-center gap-2"><FontAwesomeIcon icon={faUser} /> {user.name}</p>
                                        <p className="text-sm text-text-secondary mt-1 flex items-center gap-2"><FontAwesomeIcon icon={faEnvelope} /> {user.email}</p>
                                    </div>
                                    <RoleBadge role={user.role} />
                                </div>
                                <div className="flex justify-between items-end pt-3 border-t border-border-color">
                                    <p className="text-sm text-text-secondary flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendarDay} />
                                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEditUser(user)}
                                            className="text-text-secondary hover:text-blue-accent transition-colors p-2"
                                            title="Editar usuario"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        {currentUser.id !== user.id && (
                                            <button
                                                onClick={() => onDeleteUser(user)}
                                                className="text-red-accent hover:opacity-80 transition-opacity p-2"
                                                title="Eliminar usuario"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- VISTA DE TABLA PARA ESCRITORIO --- */}
                    <div className="hidden md:block bg-component-bg rounded-xl border border-border-color overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs uppercase bg-component-bg-hover">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Nombre</th>
                                        <th scope="col" className="px-6 py-4">Email</th>
                                        <th scope="col" className="px-6 py-4">Rol</th>
                                        <th scope="col" className="px-6 py-4">Fecha de Creación</th>
                                        <th scope="col" className="px-6 py-4"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-component-bg-hover">
                                            <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{user.name}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => onEditUser(user)}
                                                    className="text-text-secondary hover:text-blue-accent transition-colors mr-4"
                                                    title="Editar usuario"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                {currentUser.id !== user.id && (
                                                    <button
                                                        onClick={() => onDeleteUser(user)}
                                                        className="text-text-secondary hover:text-red-accent transition-colors"
                                                        title="Eliminar usuario"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-16 px-4 bg-component-bg rounded-xl border border-border-color">
                    <FontAwesomeIcon icon={faUserShield} className="text-5xl text-zinc-500 dark:text-zinc-700 mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary">No hay usuarios que gestionar</h3>
                    <p className="text-text-secondary mt-2">Cuando añadas un nuevo usuario, aparecerá aquí.</p>
                </div>
            )}
        </div>
    );
};

export default ManageUsersPage;