// autogest-app/frontend/src/pages/Settings/AccountDataSettings.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faFileExport, faExclamationTriangle, faSignOutAlt, faUserShield, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const AccountDataSettings = ({ cars, expenses, incidents, onLogoutClick, onDeleteAccountClick }) => {
    const { user } = useContext(AuthContext);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [exportMessage, setExportMessage] = useState('');

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (!passwordData.currentPassword || !passwordData.newPassword) {
            return setPasswordMessage({ type: 'error', text: 'Ambos campos son obligatorios.' });
        }
        if (passwordData.newPassword.length < 6) {
            return setPasswordMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }

        try {
            const response = await api.updatePassword(passwordData);
            setPasswordMessage({ type: 'success', text: response.message });
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.message });
        }
    };

    const handleExport = (data, filename, dataType) => {
        if (!data || data.length === 0) {
            setExportMessage(`No hay ${dataType} para exportar.`);
            setTimeout(() => setExportMessage(''), 3000);
            return;
        }
        
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const liquidButtonClass = "bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm flex items-center gap-2";

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold text-text-primary mb-4 uppercase">Cuenta y Datos</h3>
                <div className="space-y-6">
                    <form onSubmit={handlePasswordSubmit} className="p-6 bg-background/50 rounded-xl border border-border-color">
                        <h4 className="font-semibold text-text-primary mb-2 uppercase">Cambiar Contraseña</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <input name="currentPassword" type="password" placeholder="Contraseña Actual" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-secondary" />
                            <input name="newPassword" type="password" placeholder="Nueva Contraseña" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 bg-component-bg-hover border border-border-color rounded-lg focus:ring-1 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-secondary" />
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                            <button type="submit" className={liquidButtonClass}>
                                <FontAwesomeIcon icon={faKey} />
                                Actualizar
                            </button>
                            {passwordMessage.text && (
                                <span className={`text-sm font-semibold ${passwordMessage.type === 'success' ? 'text-green-accent' : 'text-red-accent'}`}>
                                    {passwordMessage.text}
                                </span>
                            )}
                        </div>
                    </form>

                    <div className="p-6 bg-background/50 rounded-xl border border-border-color">
                        <h4 className="font-semibold text-text-primary mb-2 uppercase">Exportar Datos</h4>
                        <p className="text-sm text-text-secondary mb-3">Descarga una copia de seguridad de tus datos en formato CSV.</p>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleExport(cars, 'coches.csv', 'coches')} className={liquidButtonClass}>
                                <FontAwesomeIcon icon={faFileExport} />
                                Coches
                            </button>
                            <button onClick={() => handleExport(expenses, 'gastos.csv', 'gastos')} className={liquidButtonClass}>
                                <FontAwesomeIcon icon={faFileExport} />
                                Gastos
                            </button>
                            <button onClick={() => handleExport(incidents, 'incidencias.csv', 'incidencias')} className={liquidButtonClass}>
                                <FontAwesomeIcon icon={faFileExport} />
                                Incidencias
                            </button>
                        </div>
                        {exportMessage && <p className="text-sm text-yellow-accent mt-3 font-semibold">{exportMessage}</p>}
                    </div>

                    {user && (
                        <div className="p-6 bg-background/50 rounded-xl border border-border-color lg:hidden">
                            <h4 className="font-semibold text-text-primary mb-2 uppercase">Suscripción</h4>
                            <p className="text-sm text-text-secondary mb-3">Gestiona o revisa el plan de suscripción.</p>
                            <Link to="/subscription" className="inline-flex items-center justify-center gap-2 bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm">
                                <FontAwesomeIcon icon={faCreditCard} />
                                Gestionar Suscripción
                            </Link>
                        </div>
                    )}

                    {user && user.role === 'admin' && (
                        <div className="p-6 bg-background/50 rounded-xl border border-border-color lg:hidden">
                            <h4 className="font-semibold text-text-primary mb-2 uppercase">Administración</h4>
                            <Link to="/admin" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm">
                                <FontAwesomeIcon icon={faUserShield} />
                                Gestionar Usuarios
                            </Link>
                        </div>
                    )}
                    
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <div className="p-6 bg-background/50 rounded-xl border border-border-color lg:hidden">
                         <h4 className="font-semibold text-text-primary mb-2 uppercase">Sesión</h4>
                         <button onClick={onLogoutClick} className="w-full sm:w-auto bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm flex items-center gap-2">
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            Cerrar Sesión
                        </button>
                    </div>
                    {/* --- FIN DE LA MODIFICACIÓN --- */}

                    <div className="p-6 bg-red-accent/10 rounded-xl">
                        <h4 className="font-semibold text-red-accent mb-2 uppercase">Zona de Peligro</h4>
                        <p className="text-sm text-red-accent/80 mb-3">La eliminación de tu cuenta es permanente y no se puede deshacer.</p>
                        <button onClick={onDeleteAccountClick} className="w-full sm:w-auto bg-component-bg-hover text-red-accent font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm flex items-center gap-2">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            Eliminar Mi Cuenta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountDataSettings;