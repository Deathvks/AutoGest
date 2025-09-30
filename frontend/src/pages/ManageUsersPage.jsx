// autogest-app/frontend/src/pages/ManageUsersPage.jsx
import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlusCircle, faEdit, faTrash, faUserShield, faUser, 
    faEnvelope, faCalendarDay, faCheckCircle, faExclamationTriangle,
    faPencilAlt, faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

// --- Componente para la vista de Técnico (Estilo Netflix) ---
const TechnicianView = ({ users, onAddUser, onEditUser, onExpelUser, currentUser }) => {

    const ProfileCard = ({ user, onEdit, onExpel, isCurrentUser }) => (
        <div className="group w-32 sm:w-40 cursor-pointer flex flex-col items-center gap-2 text-center">
            <div 
                onClick={() => onEdit(user)}
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden transition-all duration-200 group-hover:ring-4 ring-white ring-offset-2 ring-offset-transparent"
            >
                <img 
                    src={user.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : `https://ui-avatars.com/api/?name=${user.name}&background=3A3A3A&color=EAEAEA&size=160`} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon icon={faPencilAlt} className="text-white text-3xl" />
                </div>
            </div>
            <span className="text-text-secondary group-hover:text-text-primary transition-colors truncate w-full">
                {user.name} {isCurrentUser && '(Tú)'}
            </span>
            {currentUser.canExpelUsers && currentUser.id !== user.id && (
                 <button 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onExpel(user);
                    }}
                    className="text-xs text-red-accent/70 hover:text-red-accent hover:underline transition-colors"
                >
                    Expulsar del equipo
                </button>
            )}
        </div>
    );

    const AddProfileCard = ({ onAdd }) => (
        <div 
            onClick={onAdd}
            className="group w-32 sm:w-40 cursor-pointer flex flex-col items-center gap-2 text-center"
        >
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-component-bg-hover border-2 border-dashed border-border-color flex items-center justify-center transition-all duration-200 group-hover:border-white group-hover:bg-component-bg">
                <FontAwesomeIcon icon={faUserPlus} className="text-text-secondary text-4xl transition-colors group-hover:text-white" />
            </div>
            <span className="text-text-secondary group-hover:text-text-primary transition-colors">Invitar Empleado</span>
        </div>
    );
    
    if (!currentUser.companyId) {
        return (
            <div className="flex flex-col items-center">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">Crea tu Equipo</h1>
                    <p className="mt-4 max-w-2xl text-lg text-text-secondary">
                        Para empezar a colaborar, invita a tu primer empleado. Al hacerlo, te convertirás en el propietario del equipo.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center items-start gap-x-4 gap-y-8 sm:gap-x-8">
                    <AddProfileCard onAdd={onAddUser} />
                </div>
            </div>
        );
    }
    
    const teamOwner = users.find(u => u.id === currentUser.id);
    const teamMembers = users.filter(u => u.id !== currentUser.id && u.companyId === currentUser.companyId);

    return (
        <div className="flex flex-col items-center">
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">Gestión de Equipo</h1>
                <p className="mt-4 max-w-2xl text-lg text-text-secondary">
                    Edita los perfiles y permisos de los miembros de tu equipo.
                </p>
            </div>
            <div className="flex flex-wrap justify-center items-start gap-x-4 gap-y-8 sm:gap-x-8">
                {teamOwner && <ProfileCard key={teamOwner.id} user={teamOwner} onEdit={onEditUser} onExpel={onExpelUser} currentUser={currentUser} isCurrentUser={true} />}
                {teamMembers.map(user => (
                    <ProfileCard key={user.id} user={user} onEdit={onEditUser} onExpel={onExpelUser} currentUser={currentUser} isCurrentUser={false} />
                ))}
                {teamOwner && teamOwner.canManageRoles && (
                    <AddProfileCard onAdd={onAddUser} />
                )}
            </div>
        </div>
    );
};


// --- Componente para la vista de Administrador (Tabla) ---
const AdminView = ({ users, onAddUser, onEditUser, onDeleteUser, currentUser }) => {
    
    const RoleBadge = ({ role }) => {
        const roleStyles = {
            admin: 'bg-red-accent/10 text-red-accent',
            user: 'bg-blue-accent/10 text-blue-accent',
            // --- INICIO DE LA MODIFICACIÓN ---
            // Se vuelve a añadir el estilo para el rol 'technician'.
            technician: 'bg-green-accent/10 text-green-accent',
            // --- FIN DE LA MODIFICACIÓN ---
            technician_subscribed: 'bg-purple-500/10 text-purple-400'
        };
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${roleStyles[role] || 'bg-zinc-200'}`}>
                {role.replace('_', ' ')}
            </span>
        );
    };

    const VerificationStatus = ({ isVerified }) => {
        const statusClass = isVerified ? 'text-green-accent' : 'text-yellow-accent';
        const icon = isVerified ? faCheckCircle : faExclamationTriangle;
        const text = isVerified ? 'Verificado' : 'Pendiente';

        return (
            <span className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${statusClass}`}>
                <FontAwesomeIcon icon={icon} />
                {text}
            </span>
        );
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Gestión de Usuarios</h1>
                <button
                    onClick={onAddUser}
                    className="bg-blue-accent text-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                    title="Añadir nuevo usuario"
                >
                    <FontAwesomeIcon icon={faPlusCircle} className="w-6 h-6" />
                </button>
            </div>

            {users.length > 0 ? (
                <>
                    {/* Tarjetas para móvil */}
                    <div className="space-y-4 md:hidden">
                        {users.map(user => (
                            <div key={user.id} className="bg-component-bg rounded-xl border border-border-color p-4">
                                <div className="flex justify-between items-start gap-3 mb-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-text-primary flex items-center gap-2 truncate">
                                            <FontAwesomeIcon icon={faUser} className="flex-shrink-0"/>
                                            <span className="truncate">{user.name}</span>
                                        </p>
                                        <p className="text-sm text-text-secondary mt-1 flex items-start gap-2">
                                            <FontAwesomeIcon icon={faEnvelope} className="flex-shrink-0 mt-1"/>
                                            <span className="break-all">{user.email}</span>
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <RoleBadge role={user.role} />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm my-3">
                                     <p className="text-text-secondary flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendarDay} />
                                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                    </p>
                                    <VerificationStatus isVerified={user.isVerified} />
                                </div>
                                <div className="flex justify-end items-end pt-3 border-t border-border-color">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onEditUser(user)} className="text-text-secondary hover:text-blue-accent transition-colors p-2" title="Editar usuario">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        {currentUser.id !== user.id && (
                                            <button onClick={() => onDeleteUser(user)} className="text-red-accent hover:opacity-80 transition-opacity p-2" title="Eliminar usuario">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabla para escritorio */}
                    <div className="hidden md:block bg-component-bg rounded-xl border border-border-color overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs uppercase bg-component-bg-hover">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Nombre</th>
                                        <th scope="col" className="px-6 py-4">Email</th>
                                        <th scope="col" className="px-6 py-4">Rol</th>
                                        <th scope="col" className="px-6 py-4">Verificado</th>
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
                                            <td className="px-6 py-4"><VerificationStatus isVerified={user.isVerified} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => onEditUser(user)} className="text-text-secondary hover:text-blue-accent transition-colors mr-4" title="Editar usuario">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                {currentUser.id !== user.id && (
                                                    <button onClick={() => onDeleteUser(user)} className="text-text-secondary hover:text-red-accent transition-colors" title="Eliminar usuario">
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


// --- Componente Principal ---
const ManageUsersPage = ({ users, onAddUser, onEditUser, onDeleteUser, onExpelUser }) => {
    const { user: currentUser } = useContext(AuthContext);

    if (!currentUser) return null;

    if (currentUser.role === 'admin') {
        return <AdminView users={users} onAddUser={onAddUser} onEditUser={onEditUser} onDeleteUser={onDeleteUser} currentUser={currentUser} />;
    }
    
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se vuelve a incluir 'technician' en la condición.
    if (currentUser.role === 'technician' || currentUser.role === 'technician_subscribed') {
        return <TechnicianView users={users} onAddUser={onAddUser} onEditUser={onEditUser} onExpelUser={onExpelUser} currentUser={currentUser} />;
    }
    // --- FIN DE LA MODIFICACIÓN ---
    
    return (
        <div className="text-center text-red-accent">No tienes permiso para ver esta página.</div>
    );
};

export default ManageUsersPage;