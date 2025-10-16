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
            <h4 className="font-semibold text-text-primary mb-2 uppercase">Prueba Gratuita</h4>
            <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faRocket} className="h-5 w-5" />
                    <div className="flex-1">
                        <div className="font-bold text-sm">PRUEBA GRATUITA ACTIVA</div>
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
    // --- INICIO DE LA MODIFICACIÓN ---
    const canActivateTrial = !isSubscribed && !user.hasUsedTrial && user.role !== 'admin' && !user.companyId;
    // --- FIN DE LA MODIFICACIÓN ---
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

    const liquidButtonClass = "bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm flex items-center gap-2";

    return (
        <div>
            <h3 className="text-lg font-bold text-text-primary mb-4 uppercase">Cuenta y Datos</h3>
            
            <div className="divide-y divide-border-color">
                <form onSubmit={handlePasswordSubmit} className="py-6">
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

                {isTrialActive && !isSubscribed && (
                    <TrialCountdownMobile />
                )}

                {canActivateTrial && (
                    <div className="py-6">
                        <h4 className="font-semibold text-text-primary mb-2 uppercase">Prueba Gratuita</h4>
                        <p className="text-sm text-text-secondary mb-3">
                            No has usado tu período de prueba de 3 días. ¡Actívalo ahora para desbloquear todas las funciones!
                        </p>
                        <button onClick={onActivateTrialClick} className={liquidButtonClass}>
                            <FontAwesomeIcon icon={faRocket} />
                            Activar Prueba Gratuita
                        </button>
                    </div>
                )}

                {canExportData && (
                    <div className="py-6">
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
                )}

                <div className="py-6">
                    <h4 className="font-semibold text-text-primary mb-2 uppercase">Privacidad y Cookies</h4>
                    <p className="text-sm text-text-secondary mb-3">Gestiona tus preferencias de consentimiento de cookies.</p>
                    <button onClick={handleManageCookies} className={liquidButtonClass}>
                        <FontAwesomeIcon icon={faCookieBite} />
                        Gestionar Cookies
                    </button>
                </div>

                {user && (
                    <div className="py-6 lg:hidden">
                        <h4 className="font-semibold text-text-primary mb-2 uppercase">Suscripción</h4>
                        <p className="text-sm text-text-secondary mb-3">Gestiona o revisa el plan de suscripción.</p>
                        <Link to="/subscription" className="inline-flex items-center justify-center gap-2 bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm">
                            <FontAwesomeIcon icon={faCreditCard} />
                            Gestionar Suscripción
                        </Link>
                    </div>
                )}

                {user && user.role === 'admin' && (
                    <div className="py-6 lg:hidden">
                        <h4 className="font-semibold text-text-primary mb-2 uppercase">Administración</h4>
                        <Link to="/admin" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm">
                            <FontAwesomeIcon icon={faUserShield} />
                            Gestionar Usuarios
                        </Link>
                    </div>
                )}
                
                <div className="py-6 lg:hidden">
                     <h4 className="font-semibold text-text-primary mb-2 uppercase">Sesión</h4>
                     <button onClick={onLogoutClick} className="w-full sm:w-auto bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm flex items-center gap-2">
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Cerrar Sesión
                    </button>
                </div>

                <div className="py-6">
                    <h4 className="font-semibold text-red-accent mb-2 uppercase">Zona de Peligro</h4>
                    <p className="text-sm text-red-accent/80 mb-3">La eliminación de tu cuenta es permanente y no se puede deshacer.</p>
                    <button onClick={onDeleteAccountClick} className="w-full sm:w-auto bg-component-bg-hover text-red-accent font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        Eliminar Mi Cuenta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountDataSettings;