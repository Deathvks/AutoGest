// autogest-app/frontend/src/pages/ManageUsersPage.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faEdit, faTrash, faUserShield, faUser,
    faEnvelope, faCalendarDay, faCheckCircle, faExclamationTriangle,
    faPencilAlt, faUserPlus, faCrown, faXmark, faLock, faRocket
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

const SubscriptionStatusBadge = ({ status, expiry }) => {
    const statusInfo = {
        active: { text: 'Activa', icon: faCheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
        cancelled: { text: 'Cancelada', icon: faExclamationTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
        past_due: { text: 'Pago Pendiente', icon: faExclamationTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
        inactive: { text: 'Inactiva', icon: faXmark, color: 'text-gray-500', bg: 'bg-gray-100 border-gray-200' },
    };

    const currentStatus = statusInfo[status] || statusInfo.inactive;
    const expiryDate = expiry ? new Date(expiry).toLocaleDateString('es-ES') : null;

    if (status === null || status === undefined) {
        return null;
    }

    return (
        <div className="flex flex-col items-start">
            <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded border ${currentStatus.bg} ${currentStatus.color} uppercase`}>
                <FontAwesomeIcon icon={currentStatus.icon} />
                {currentStatus.text}
            </span>
            {(status === 'active' || status === 'cancelled') && expiryDate && (
                <span className="text-[10px] text-gray-500 mt-1 font-medium">
                    Expira: {expiryDate}
                </span>
            )}
        </div>
    );
};

const TrialStatusBadge = ({ trialExpiresAt }) => {
    if (!trialExpiresAt || new Date(trialExpiresAt) < new Date()) {
        return null;
    }

    const endDate = new Date(trialExpiresAt);
    const now = new Date();
    const diffTime = Math.abs(endDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
        <div className="flex flex-col items-start">
            <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded border bg-yellow-50 border-yellow-200 text-yellow-700 uppercase">
                <FontAwesomeIcon icon={faRocket} />
                En Prueba
            </span>
            <span className="text-[10px] text-gray-500 mt-1 font-medium">
                Quedan: {diffDays} día(s)
            </span>
        </div>
    );
};

const TechnicianView = ({ users, onAddUser, onEditUser, currentUser, isLocked }) => {

    const ProfileCard = ({ user, onEdit, isCurrentUser }) => (
        <div className="group w-36 sm:w-44 cursor-pointer flex flex-col items-center gap-3 text-center">
            <div
                onClick={() => !user.isOwner && !isCurrentUser && onEdit(user)}
                className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden transition-all duration-200 border-2 ${user.isOwner ? 'border-accent ring-2 ring-accent/20' : 'border-gray-200'} ${!user.isOwner && !isCurrentUser ? 'group-hover:border-accent' : ''}`}
            >
                <img
                    src={user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${user.name}&background=f3f4f6&color=374151&size=160`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                />
                {!user.isOwner && !isCurrentUser && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FontAwesomeIcon icon={faPencilAlt} className="text-white text-2xl" />
                    </div>
                )}
            </div>
            <div>
                <p className={`font-bold text-sm truncate w-full transition-colors ${!user.isOwner && !isCurrentUser ? 'text-gray-900 group-hover:text-accent' : 'text-gray-900'}`}>
                    {user.name} {isCurrentUser && <span className="text-gray-500 font-normal">(Tú)</span>}
                </p>
                {user.isOwner && (
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
                        <FontAwesomeIcon icon={faCrown} />
                        Propietario
                    </span>
                )}
            </div>
        </div>
    );

    const AddProfileCard = ({ onAdd }) => (
        <div
            onClick={onAdd}
            className="group w-36 sm:w-44 cursor-pointer flex flex-col items-center gap-3 text-center"
        >
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center transition-all duration-200 group-hover:border-accent group-hover:bg-white">
                <FontAwesomeIcon icon={faUserPlus} className="text-gray-400 text-3xl transition-colors group-hover:text-accent" />
            </div>
            <span className="text-gray-500 text-sm font-bold group-hover:text-accent transition-colors">Invitar Empleado</span>
        </div>
    );

    const LockedAddCard = () => (
        <div className="w-36 sm:w-44 flex flex-col items-center gap-3 text-center relative group">
             <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center opacity-60">
                <FontAwesomeIcon icon={faUserPlus} className="text-gray-400 text-3xl" />
            </div>
            <span className="text-gray-400 text-sm font-bold">Invitar Empleado</span>
            
            <Link 
                to="/subscription" 
                className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full cursor-pointer border-2 border-accent shadow-sm"
            >
                <FontAwesomeIcon icon={faLock} className="text-accent text-xl mb-1" />
                <span className="text-accent text-xs font-bold px-2">Suscríbete</span>
            </Link>
        </div>
    );

    if (!currentUser.companyId) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                <h1 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">Crea tu Equipo</h1>
                <p className="mt-2 max-w-xl mx-auto text-gray-500">
                    Invita a tu primer empleado para comenzar. Te convertirás automáticamente en el propietario del equipo.
                </p>
                <div className="mt-8 flex justify-center">
                    {isLocked ? <LockedAddCard /> : <AddProfileCard onAdd={onAddUser} />}
                </div>
            </div>
        );
    }

    const teamOwner = users.find(u => u.isOwner);
    const teamMembers = users.filter(u => !u.isOwner);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-10">
                <h1 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">Gestión de Equipo</h1>
                <p className="mt-2 text-gray-500">
                    Administra los miembros y permisos de tu organización.
                </p>
            </div>
            <div className="flex flex-wrap justify-center items-start gap-8">
                {teamOwner && <ProfileCard key={teamOwner.id} user={teamOwner} onEdit={onEditUser} currentUser={currentUser} isCurrentUser={teamOwner.id === currentUser.id} />}
                {teamMembers.map(user => (
                    <ProfileCard key={user.id} user={user} onEdit={onEditUser} currentUser={currentUser} isCurrentUser={user.id === currentUser.id} />
                ))}
                {(currentUser.isOwner || currentUser.canManageRoles) && (
                    isLocked ? <LockedAddCard /> : <AddProfileCard onAdd={onAddUser} />
                )}
            </div>
        </div>
    );
};

const AdminView = ({ users, onAddUser, onEditUser, onDeleteUser, currentUser }) => {

    const RoleBadge = ({ role }) => {
        const roleStyles = {
            admin: 'bg-red-100 text-red-800 border-red-200',
            user: 'bg-blue-100 text-blue-800 border-blue-200',
            technician: 'bg-green-100 text-green-800 border-green-200',
            technician_subscribed: 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return (
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wide ${roleStyles[role] || 'bg-gray-100 text-gray-800'}`}>
                {role.replace('_', ' ')}
            </span>
        );
    };

    const VerificationStatus = ({ isVerified }) => {
        return (
            <span className={`flex items-center gap-1.5 text-xs font-bold uppercase ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                <FontAwesomeIcon icon={isVerified ? faCheckCircle : faExclamationTriangle} />
                {isVerified ? 'Verificado' : 'Pendiente'}
            </span>
        );
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Gestión de Usuarios</h1>
                <button
                    onClick={onAddUser}
                    className="bg-accent text-white px-4 py-2.5 rounded-lg shadow hover:bg-accent-hover transition-colors flex items-center gap-2 font-bold text-sm uppercase"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {users.length > 0 ? (
                <>
                    <div className="space-y-4 md:hidden">
                        {users.map(user => (
                            <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex justify-between items-start gap-3 mb-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FontAwesomeIcon icon={faUser} className="text-gray-400"/>
                                            <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-400"/>
                                            <span className="break-all">{user.email}</span>
                                        </div>
                                    </div>
                                    <RoleBadge role={user.role} />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 py-3 border-t border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Estado</p>
                                        <VerificationStatus isVerified={user.isVerified} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Registro</p>
                                        <p className="text-xs font-medium text-gray-700">
                                            <FontAwesomeIcon icon={faCalendarDay} className="mr-1 text-gray-400" />
                                            {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Suscripción</p>
                                    {user.trialExpiresAt ? (
                                        <TrialStatusBadge trialExpiresAt={user.trialExpiresAt} />
                                    ) : (
                                        (user.role === 'technician_subscribed' || (user.role === 'user' && user.subscriptionStatus !== 'inactive')) ? (
                                            <SubscriptionStatusBadge status={user.subscriptionStatus} expiry={user.subscriptionExpiry} />
                                        ) : <span className="text-xs text-gray-400 font-medium">N/A</span>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                                    <button onClick={() => onEditUser(user)} className="p-2 text-gray-400 hover:text-accent transition-colors rounded hover:bg-gray-50">
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    {currentUser.id !== user.id && (
                                        <button onClick={() => onDeleteUser(user)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-gray-50">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs uppercase bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Usuario</th>
                                        <th scope="col" className="px-6 py-4">Rol</th>
                                        <th scope="col" className="px-6 py-4">Suscripción</th>
                                        <th scope="col" className="px-6 py-4">Estado</th>
                                        <th scope="col" className="px-6 py-4">Fecha Registro</th>
                                        <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <RoleBadge role={user.role} />
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.trialExpiresAt ? (
                                                    <TrialStatusBadge trialExpiresAt={user.trialExpiresAt} />
                                                ) : (
                                                    (user.role === 'technician_subscribed' || (user.role === 'user' && user.subscriptionStatus !== 'inactive')) ? (
                                                        <SubscriptionStatusBadge status={user.subscriptionStatus} expiry={user.subscriptionExpiry} />
                                                    ) : <span className="text-xs text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <VerificationStatus isVerified={user.isVerified} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button onClick={() => onEditUser(user)} className="text-gray-400 hover:text-accent transition-colors mr-3" title="Editar">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                {currentUser.id !== user.id && (
                                                    <button onClick={() => onDeleteUser(user)} className="text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
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
                <div className="text-center py-20 px-4 bg-white rounded-lg border border-gray-200 border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        <FontAwesomeIcon icon={faUserShield} className="text-3xl text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No hay usuarios</h3>
                    <p className="text-gray-500 mt-2">Cuando añadas un nuevo usuario, aparecerá aquí.</p>
                </div>
            )}
        </div>
    );
};

const ManageUsersPage = ({ users, onAddUser, onEditUser, onDeleteUser, onExpelUser }) => {
    const { user: currentUser } = useContext(AuthContext);

    if (!currentUser) return null;

    const isSubscribed = currentUser.subscriptionStatus === 'active';
    const isTrialing = currentUser.trialExpiresAt && new Date(currentUser.trialExpiresAt) > new Date();
    const isLocked = !isSubscribed && isTrialing;

    if (currentUser.role === 'admin') {
        return <AdminView users={users} onAddUser={onAddUser} onEditUser={onEditUser} onDeleteUser={onDeleteUser} currentUser={currentUser} />;
    }

    if (currentUser.role === 'technician' || currentUser.role === 'technician_subscribed' || (currentUser.role === 'user' && currentUser.canExpelUsers)) {
        return <TechnicianView users={users} onAddUser={onAddUser} onEditUser={onEditUser} onExpelUser={onExpelUser} currentUser={currentUser} isLocked={isLocked} />;
    }

    return (
        <div className="text-center text-red-600 font-bold mt-10">No tienes permiso para ver esta página.</div>
    );
};

export default ManageUsersPage;