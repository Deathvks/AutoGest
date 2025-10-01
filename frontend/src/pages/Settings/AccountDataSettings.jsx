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

    return (
        <div className="p-6 bg-component-bg rounded-xl border border-border-color">
            <h3 className="text-lg font-bold text-text-primary mb-4">CUENTA Y DATOS</h3>
            <div className="space-y-6">
                <form onSubmit={handlePasswordSubmit}>
                    <h4 className="font-semibold text-text-primary mb-2">CAMBIAR CONTRASEÑA</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <input name="currentPassword" type="password" placeholder="CONTRASEÑA ACTUAL" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary" />
                        <input name="newPassword" type="password" placeholder="NUEVA CONTRASEÑA" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary" />
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                        <button type="submit" className="w-full sm:w-auto bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                            <FontAwesomeIcon icon={faKey} className="mr-2" />
                            ACTUALIZAR CONTRASEÑA
                        </button>
                        {passwordMessage.text && (
                            <span className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-accent' : 'text-red-accent'}`}>
                                {passwordMessage.text}
                            </span>
                        )}
                    </div>
                </form>

                <hr className="border-border-color" />

                <div>
                    <h4 className="font-semibold text-text-primary mb-2">EXPORTAR DATOS</h4>
                    <p className="text-sm text-text-secondary mb-3">DESCARGA UNA COPIA DE SEGURIDAD DE TUS DATOS EN FORMATO CSV.</p>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleExport(cars, 'coches.csv', 'coches')} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                            EXPORTAR COCHES
                        </button>
                        <button onClick={() => handleExport(expenses, 'gastos.csv', 'gastos')} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                            EXPORTAR GASTOS
                        </button>
                        <button onClick={() => handleExport(incidents, 'incidencias.csv', 'incidencias')} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                            EXPORTAR INCIDENCIAS
                        </button>
                    </div>
                    {exportMessage && <p className="text-sm text-yellow-accent mt-3">{exportMessage}</p>}
                </div>

                {user && (
                    <div className="lg:hidden">
                        <hr className="border-border-color" />
                        <div className="mt-6">
                            <h4 className="font-semibold text-text-primary mb-2">SUSCRIPCIÓN</h4>
                            <p className="text-sm text-text-secondary mb-3">GESTIONA O REVISA EL PLAN DE SUSCRIPCIÓN.</p>
                            <Link to="/subscription" className="inline-flex items-center justify-center gap-2 bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                                <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                GESTIONAR SUSCRIPCIÓN
                            </Link>
                        </div>
                    </div>
                )}

                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                {/* Ahora solo se muestra para el rol 'admin', ya que los demás acceden desde el header */}
                {user && user.role === 'admin' && (
                    <div className="lg:hidden">
                        <hr className="border-border-color" />
                        <div className="mt-6">
                            <h4 className="font-semibold text-text-primary mb-2">ADMINISTRACIÓN</h4>
                            <Link to="/admin" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                                <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                                GESTIONAR USUARIOS
                            </Link>
                        </div>
                    </div>
                )}
                {/* --- FIN DE LA MODIFICACIÓN --- */}
                
                <hr className="border-border-color" />
                
                <div>
                    <h4 className="font-semibold text-text-primary mb-2">SESIÓN</h4>
                     <button onClick={onLogoutClick} className="w-full sm:w-auto bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                        CERRAR SESIÓN
                    </button>
                </div>

                <hr className="border-border-color" />

                <div>
                    <h4 className="font-semibold text-red-accent mb-2">ZONA DE PELIGRO</h4>
                    <p className="text-sm text-text-secondary mb-3">LA ELIMINACIÓN DE TU CUENTA ES PERMANENTE Y NO SE PUEDE DESHACER.</p>
                    <button onClick={onDeleteAccountClick} className="w-full sm:w-auto bg-red-accent/10 text-red-accent px-4 py-2 rounded-lg hover:bg-red-accent/20 transition-colors text-sm font-medium">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                        ELIMINAR MI CUENTA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountDataSettings;