import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faKey, faFileExport, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import api from '../services/api';

// --- Sub-componente para un interruptor (Toggle) ---
const ToggleSwitch = ({ label, enabled, onChange }) => (
    <div className="flex justify-between items-center">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <button
            onClick={onChange}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

// --- Componente Principal de la Página ---
const Settings = ({ isDarkMode, setIsDarkMode, cars, expenses, incidents }) => {
    const [notifications, setNotifications] = useState({
        emailOnSale: true,
        emailOnIncident: false,
    });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });


    const handleNotificationChange = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

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
            setPasswordData({ currentPassword: '', newPassword: '' }); // Limpia los campos
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.message });
        }
    };

    const handleExport = (data, filename) => {
        if (!data || data.length === 0) {
            alert(`No hay datos para exportar en ${filename}.`);
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-8">Ajustes</h1>

            <div className="space-y-8">

                {/* --- Sección de Apariencia --- */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Apariencia</h3>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700 dark:text-slate-200">Modo Oscuro</span>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                        </button>
                    </div>
                </div>

                {/* --- Sección de Notificaciones --- */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Notificaciones</h3>
                    <div className="space-y-4">
                        <ToggleSwitch
                            label="Email al vender un coche"
                            enabled={notifications.emailOnSale}
                            onChange={() => handleNotificationChange('emailOnSale')}
                        />
                        <ToggleSwitch
                            label="Email al registrar incidencia"
                            enabled={notifications.emailOnIncident}
                            onChange={() => handleNotificationChange('emailOnIncident')}
                        />
                    </div>
                </div>

                {/* --- Sección de Cuenta --- */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Cuenta y Datos</h3>
                    <div className="space-y-6">

                        <form onSubmit={handlePasswordSubmit}>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Cambiar contraseña</h4>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input name="currentPassword" type="password" placeholder="Contraseña actual" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                <input name="newPassword" type="password" placeholder="Nueva contraseña" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="mt-3 flex items-center gap-4">
                                <button type="submit" className="w-full sm:w-auto bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium">
                                    <FontAwesomeIcon icon={faKey} className="mr-2" />
                                    Actualizar Contraseña
                                </button>
                                {passwordMessage.text && (
                                    <span className={`text-sm ${passwordMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {passwordMessage.text}
                                    </span>
                                )}
                            </div>
                        </form>

                        <hr className="border-slate-200 dark:border-slate-700" />

                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Exportar datos</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Descarga una copia de seguridad de tus datos en formato CSV.</p>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => handleExport(cars, 'coches.csv')} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium">
                                    <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                                    Exportar Coches
                                </button>
                                <button onClick={() => handleExport(expenses, 'gastos.csv')} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium">
                                    <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                                    Exportar Gastos
                                </button>
                                <button onClick={() => handleExport(incidents, 'incidencias.csv')} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium">
                                    <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                                    Exportar Incidencias
                                </button>
                            </div>
                        </div>

                        <hr className="border-slate-200 dark:border-slate-700" />

                        <div>
                            <h4 className="font-semibold text-rose-600 dark:text-rose-400 mb-2">Zona de peligro</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">La eliminación de tu cuenta es permanente y no se puede deshacer.</p>
                            <button className="w-full sm:w-auto bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-4 py-2 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800 transition-colors text-sm font-medium">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                                Eliminar mi cuenta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;