// autogest-app/frontend/src/pages/Settings.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faKey, faFileExport, faExclamationTriangle, faSignOutAlt, faUserShield } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import VersionIndicator from '../components/VersionIndicator';
import { APP_NAME } from '../config/version';

// --- Componente Principal de la Página ---
const Settings = ({ isDarkMode, setIsDarkMode, cars, expenses, incidents, onDeleteAccountClick }) => {
    const { user, logout } = useContext(AuthContext);
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
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-8">Ajustes</h1>

            <div className="space-y-8">

                {/* --- Sección de Apariencia --- */}
                <div className="p-6 bg-component-bg rounded-xl border border-border-color">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Apariencia</h3>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-text-primary">Modo Oscuro</span>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-full bg-component-bg-hover text-text-secondary hover:bg-border-color transition-colors"
                        >
                            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                        </button>
                    </div>
                </div>

                {/* --- Sección de Cuenta --- */}
                <div className="p-6 bg-component-bg rounded-xl border border-border-color">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Cuenta y Datos</h3>
                    <div className="space-y-6">

                        <form onSubmit={handlePasswordSubmit}>
                            <h4 className="font-semibold text-text-primary mb-2">Cambiar contraseña</h4>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input name="currentPassword" type="password" placeholder="Contraseña actual" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary" />
                                <input name="newPassword" type="password" placeholder="Nueva contraseña" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary" />
                            </div>
                            <div className="mt-3 flex items-center gap-4">
                                <button type="submit" className="w-full sm:w-auto bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                                    <FontAwesomeIcon icon={faKey} className="mr-2" />
                                    Actualizar Contraseña
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
                            <h4 className="font-semibold text-text-primary mb-2">Exportar datos</h4>
                            <p className="text-sm text-text-secondary mb-3">Descarga una copia de seguridad de tus datos en formato CSV.</p>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => handleExport(cars, 'coches.csv', 'coches')} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                                    <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                                    Exportar Coches
                                </button>
                                <button onClick={() => handleExport(expenses, 'gastos.csv', 'gastos')} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                                    <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                                    Exportar Gastos
                                </button>
                                <button onClick={() => handleExport(incidents, 'incidencias.csv', 'incidencias')} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                                    <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                                    Exportar Incidencias
                                </button>
                            </div>
                            {exportMessage && <p className="text-sm text-yellow-accent mt-3">{exportMessage}</p>}
                        </div>

                        {user && user.role === 'admin' && (
                            <>
                                <hr className="border-border-color" />
                                <div>
                                    <h4 className="font-semibold text-text-primary mb-2">Administración</h4>
                                    <Link to="/admin" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                                        <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                                        Gestionar Usuarios
                                    </Link>
                                </div>
                            </>
                        )}
                        
                        <hr className="border-border-color" />
                        
                        <div>
                            <h4 className="font-semibold text-text-primary mb-2">Sesión</h4>
                             <button onClick={logout} className="w-full sm:w-auto bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                Cerrar Sesión
                            </button>
                        </div>

                        <hr className="border-border-color" />

                        <div>
                            <h4 className="font-semibold text-red-accent mb-2">Zona de peligro</h4>
                            <p className="text-sm text-text-secondary mb-3">La eliminación de tu cuenta es permanente y no se puede deshacer.</p>
                            <button onClick={onDeleteAccountClick} className="w-full sm:w-auto bg-red-accent/10 text-red-accent px-4 py-2 rounded-lg hover:bg-red-accent/20 transition-colors text-sm font-medium">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                                Eliminar mi cuenta
                            </button>
                        </div>
                        
                    </div>
                </div>

                <VersionIndicator appName={APP_NAME} />
            </div>
        </div>
    );
};

export default Settings;