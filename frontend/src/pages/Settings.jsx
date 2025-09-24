// autogest-app/frontend/src/pages/Settings.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faKey, faFileExport, faExclamationTriangle, faSignOutAlt, faUserShield, faBuilding, faCreditCard, faPercentage } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import VersionIndicator from '../components/VersionIndicator';
import { APP_NAME } from '../config/version';

const Settings = ({ isDarkMode, setIsDarkMode, cars, expenses, incidents, onDeleteAccountClick, onBusinessDataClick, businessDataMessage, onLogoutClick }) => {
    const { user, updateUserProfile } = useContext(AuthContext); // <-- Se añade updateUserProfile
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [exportMessage, setExportMessage] = useState('');

    // --- INICIO DE LA MODIFICACIÓN ---
    const [igicEnabled, setIgicEnabled] = useState(user?.applyIgic || false);
    const [igicMessage, setIgicMessage] = useState('');

    const handleIgicToggle = async () => {
        const newIgicState = !igicEnabled;
        setIgicEnabled(newIgicState);
        try {
            await updateUserProfile({ applyIgic: newIgicState });
            setIgicMessage('¡GUARDADO!');
            setTimeout(() => setIgicMessage(''), 3000);
        } catch (error) {
            setIgicMessage('Error al guardar');
            // Revertir el estado si hay un error
            setIgicEnabled(!newIgicState);
        }
    };
    // --- FIN DE LA MODIFICACIÓN ---

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
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-8">AJUSTES</h1>

            <div className="space-y-8">

                <div className="p-6 bg-component-bg rounded-xl border border-border-color">
                    <h3 className="text-lg font-bold text-text-primary mb-4">APARIENCIA</h3>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-text-primary">MODO OSCURO</span>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-full text-text-secondary transition-colors"
                        >
                            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                        </button>
                    </div>
                </div>
                
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                <div className="p-6 bg-component-bg rounded-xl border border-border-color">
                    <h3 className="text-lg font-bold text-text-primary mb-4">IMPUESTOS</h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="font-medium text-text-primary">APLICAR IGIC (7%) EN FACTURAS</span>
                            <p className="text-xs text-text-secondary">Si se activa, se desglosará un 7% de IGIC en las facturas.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {igicMessage && <span className="text-sm text-green-accent font-medium">{igicMessage}</span>}
                            <button
                                type="button"
                                onClick={handleIgicToggle}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${igicEnabled ? 'bg-accent' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${igicEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
                {/* --- FIN DE LA MODIFICACIÓN --- */}

                <div className="p-6 bg-component-bg rounded-xl border border-border-color">
                    <h3 className="text-lg font-bold text-text-primary mb-4">DATOS DE EMPRESA</h3>
                    <p className="text-sm text-text-secondary mb-3">EDITA LOS DATOS DE TU EMPRESA QUE APARECERÁN EN LAS FACTURAS Y PROFORMAS.</p>
                    <div className="flex items-center gap-4">
                        <button onClick={onBusinessDataClick} className="w-full sm:w-auto bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                            <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                            EDITAR DATOS DE EMPRESA
                        </button>
                        {businessDataMessage && (
                            <span className="text-sm text-green-accent font-medium">
                                {businessDataMessage}
                            </span>
                        )}
                    </div>
                </div>

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

                        {user && (user.role === 'user') && (
                            <div className="lg:hidden">
                                <hr className="border-border-color" />
                                <div className="mt-6">
                                    <h4 className="font-semibold text-text-primary mb-2">SUSCRIPCIÓN</h4>
                                    <p className="text-sm text-text-secondary mb-3">GESTIONA TU PLAN DE SUSCRIPCIÓN, FACTURACIÓN Y MÉTODOS DE PAGO.</p>
                                    <Link to="/subscription" className="inline-flex items-center justify-center gap-2 bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium">
                                        <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                        GESTIONAR SUSCRIPCIÓN
                                    </Link>
                                </div>
                            </div>
                        )}

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

                <div className="p-6 bg-component-bg rounded-xl border border-border-color lg:hidden">
                    <h3 className="text-lg font-bold text-text-primary mb-4">ACERCA DE</h3>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-text-primary">{APP_NAME}</span>
                        <VersionIndicator />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;