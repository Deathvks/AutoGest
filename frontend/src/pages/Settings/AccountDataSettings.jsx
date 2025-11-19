// frontend/src/pages/Settings/AccountDataSettings.jsx
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faFileExport, faExclamationTriangle, faSignOutAlt, faUserShield, faCreditCard, faCookieBite, faRocket } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const TrialCountdownMobile = () => {
    const { trialTimeLeft } = useContext(AuthContext);

    if (!trialTimeLeft) {
        return <span className="block text-xs font-bold">Prueba Expirada</span>;
    }

    const { days, hours, minutes, seconds } = trialTimeLeft;
    let timeLeftString = '';
    if (days > 0) {
        timeLeftString = `Quedan: ${days}d ${hours}h`;
    } else if (hours > 0) {
        timeLeftString = `Quedan: ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        timeLeftString = `Quedan: ${minutes}m ${seconds}s`;
    } else {
        timeLeftString = `Quedan: ${seconds}s`;
    }

    return (
        <div className="lg:hidden py-6">
            <h4 className="font-bold text-gray-900 mb-2 uppercase text-sm">Prueba Gratuita</h4>
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faRocket} className="h-5 w-5" />
                    <div className="flex-1">
                        <div className="font-bold text-sm uppercase">PRUEBA GRATUITA ACTIVA</div>
                        <span className="block text-xs font-bold">{timeLeftString}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AccountDataSettings = ({ cars, expenses, incidents, onLogoutClick, onDeleteAccountClick, onActivateTrialClick }) => {
    const { user, isTrialActive } = useContext(AuthContext);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [exportMessage, setExportMessage] = useState('');

    const isSubscribed = user.subscriptionStatus === 'active';
    const canActivateTrial = !isSubscribed && !user.hasUsedTrial && user.role !== 'admin' && !user.companyId;
    const canExportData = isSubscribed || isTrialActive || user.role === 'admin';

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
    
    const handleManageCookies = () => {
        window.dispatchEvent(new Event('openCookieConsent'));
    };

    const buttonBaseClass = "bg-white text-gray-700 font-bold px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 shadow-sm uppercase";

    return (
        <div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-6 uppercase tracking-wide">Cuenta y Datos</h3>
            
            <div className="divide-y divide-gray-100">
                <form onSubmit={handlePasswordSubmit} className="py-6">
                    <h4 className="font-bold text-gray-900 mb-4 uppercase text-sm">Cambiar Contraseña</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <input 
                            name="currentPassword" 
                            type="password" 
                            placeholder="Contraseña Actual" 
                            value={passwordData.currentPassword} 
                            onChange={handlePasswordChange} 
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 shadow-sm" 
                        />
                        <input 
                            name="newPassword" 
                            type="password" 
                            placeholder="Nueva Contraseña" 
                            value={passwordData.newPassword} 
                            onChange={handlePasswordChange} 
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 shadow-sm" 
                        />
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                        <button type="submit" className="bg-accent text-white font-bold px-6 py-2.5 rounded-lg shadow hover:bg-accent-hover transition-colors text-sm flex items-center gap-2 uppercase">
                            <FontAwesomeIcon icon={faKey} />
                            Actualizar
                        </button>
                        {passwordMessage.text && (
                            <span className={`text-sm font-bold ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {passwordMessage.text}
                            </span>
                        )}
                    </div>
                </form>

                {isTrialActive && !isSubscribed && (
                    <TrialCountdownMobile />
                )}

                {canActivateTrial && (
                    <div className="py-6">
                        <h4 className="font-bold text-gray-900 mb-2 uppercase text-sm">Prueba Gratuita</h4>
                        <p className="text-sm text-gray-500 mb-4">
                            No has usado tu período de prueba de 3 días. ¡Actívalo ahora para desbloquear todas las funciones!
                        </p>
                        <button onClick={onActivateTrialClick} className="bg-accent text-white font-bold px-6 py-2.5 rounded-lg shadow hover:bg-accent-hover transition-colors text-sm flex items-center gap-2 uppercase">
                            <FontAwesomeIcon icon={faRocket} />
                            Activar Prueba Gratuita
                        </button>
                    </div>
                )}

                {canExportData && (
                    <div className="py-6">
                        <h4 className="font-bold text-gray-900 mb-2 uppercase text-sm">Exportar Datos</h4>
                        <p className="text-sm text-gray-500 mb-4">Descarga una copia de seguridad de tus datos en formato CSV.</p>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => handleExport(cars, 'coches.csv', 'coches')} className={buttonBaseClass}>
                                <FontAwesomeIcon icon={faFileExport} />
                                Coches
                            </button>
                            <button onClick={() => handleExport(expenses, 'gastos.csv', 'gastos')} className={buttonBaseClass}>
                                <FontAwesomeIcon icon={faFileExport} />
                                Gastos
                            </button>
                            <button onClick={() => handleExport(incidents, 'incidencias.csv', 'incidencias')} className={buttonBaseClass}>
                                <FontAwesomeIcon icon={faFileExport} />
                                Incidencias
                            </button>
                        </div>
                        {exportMessage && <p className="text-sm text-yellow-600 mt-3 font-bold">{exportMessage}</p>}
                    </div>
                )}

                <div className="py-6">
                    <h4 className="font-bold text-gray-900 mb-2 uppercase text-sm">Privacidad y Cookies</h4>
                    <p className="text-sm text-gray-500 mb-4">Gestiona tus preferencias de consentimiento de cookies.</p>
                    <button onClick={handleManageCookies} className={buttonBaseClass}>
                        <FontAwesomeIcon icon={faCookieBite} />
                        Gestionar Cookies
                    </button>
                </div>

                {user && (
                    <div className="py-6 lg:hidden">
                        <h4 className="font-bold text-gray-900 mb-2 uppercase text-sm">Suscripción</h4>
                        <p className="text-sm text-gray-500 mb-4">Gestiona o revisa el plan de suscripción.</p>
                        <Link to="/subscription" className={buttonBaseClass}>
                            <FontAwesomeIcon icon={faCreditCard} />
                            Gestionar Suscripción
                        </Link>
                    </div>
                )}

                {user && user.role === 'admin' && (
                    <div className="py-6 lg:hidden">
                        <h4 className="font-bold text-gray-900 mb-2 uppercase text-sm">Administración</h4>
                        <Link to="/admin" className={`w-full sm:w-auto ${buttonBaseClass} justify-center`}>
                            <FontAwesomeIcon icon={faUserShield} />
                            Gestionar Usuarios
                        </Link>
                    </div>
                )}
                
                <div className="py-6 lg:hidden">
                     <h4 className="font-bold text-gray-900 mb-2 uppercase text-sm">Sesión</h4>
                     <button onClick={onLogoutClick} className={`w-full sm:w-auto ${buttonBaseClass} justify-center`}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Cerrar Sesión
                    </button>
                </div>

                <div className="py-6">
                    <h4 className="font-bold text-red-600 mb-2 uppercase text-sm">Zona de Peligro</h4>
                    <p className="text-sm text-gray-500 mb-4">La eliminación de tu cuenta es permanente y no se puede deshacer.</p>
                    <button 
                        onClick={onDeleteAccountClick} 
                        className="w-full sm:w-auto bg-white text-red-600 font-bold px-4 py-2.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2 uppercase shadow-sm"
                    >
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        Eliminar Mi Cuenta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountDataSettings;