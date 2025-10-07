// autogest-app/frontend/src/pages/Settings/BusinessDataSettings.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUpload, faTrash, faBuildingCircleCheck, faSave, faIdCard, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const ReadOnlyInfoItem = ({ icon, label, value }) => (
    <div className="flex items-center text-sm">
        <FontAwesomeIcon icon={icon} className="w-4 h-4 text-text-secondary mr-3 flex-shrink-0" />
        <span className="font-medium text-text-secondary w-28">{label}:</span>
        <span className="font-semibold text-text-primary break-words">{value || 'No especificado'}</span>
    </div>
);

const BusinessDataSettings = ({ onBusinessDataClick, businessDataMessage }) => {
    const { user, updateUserProfile } = useContext(AuthContext);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(user?.logoUrl || '');
    const [logoMessage, setLogoMessage] = useState({ type: '', text: '' });
    const logoInputRef = useRef(null);

    const canEdit = user.role === 'admin' || user.isOwner;

    useEffect(() => {
        setLogoPreview(user?.logoUrl || '');
    }, [user?.logoUrl]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setLogoMessage({ type: 'error', text: 'El logo no puede pesar más de 10MB.' });
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setLogoMessage({ type: 'info', text: 'Logo listo para subir. Guarda los cambios para aplicarlo.' });
        }
    };

    const handleDeleteLogo = async () => {
        setLogoMessage({ type: '', text: '' });
        try {
            await api.deleteLogo();
            updateUserProfile({ ...user, logoUrl: null });
            setLogoFile(null);
            setLogoPreview('');
            setLogoMessage({ type: 'success', text: 'Logo eliminado con éxito.' });
            setTimeout(() => setLogoMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setLogoMessage({ type: 'error', text: 'Error al eliminar el logo.' });
        }
    };
    
    const handleSaveChanges = async () => {
        if (!logoFile) return;
        const formData = new FormData();
        formData.append('logo', logoFile);
        try {
            await updateUserProfile(formData);
            setLogoFile(null);
            setLogoMessage({ type: 'success', text: '¡Logo guardado con éxito!' });
            setTimeout(() => setLogoMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setLogoMessage({ type: 'error', text: 'Error al guardar el logo.' });
        }
    };

    if (user.role === 'user' && !user.companyId) {
        return null;
    }

    return (
        <div>
            <h3 className="text-lg font-bold text-text-primary mb-4 uppercase">Datos de Empresa</h3>
            
            {canEdit ? (
                <div className="space-y-6">
                    <div className="p-6 bg-background/50 rounded-xl border border-border-color">
                        <p className="text-sm text-text-secondary mb-3">Edita los datos de tu empresa que aparecerán en las facturas y proformas.</p>
                        <div className="flex items-center gap-4">
                            <button onClick={onBusinessDataClick} className="bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm flex items-center gap-2 border border-border-color">
                                <FontAwesomeIcon icon={faBuilding} />
                                Editar Datos
                            </button>
                            {businessDataMessage && (
                                <span className="text-sm text-green-accent font-semibold">
                                    {businessDataMessage}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="p-6 bg-background/50 rounded-xl border border-border-color">
                        <h4 className="font-semibold text-text-primary mb-2 uppercase">Logo de la Empresa</h4>
                        <p className="text-sm text-text-secondary mb-3">Sube el logo para que aparezca en tus facturas (máx 10MB).</p>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border-color flex-shrink-0">
                                {logoPreview ? (
                                    <img src={logoPreview.startsWith('blob:') ? logoPreview : `${API_BASE_URL}${logoPreview}`} alt="Logo" className="h-full w-full object-contain" />
                                ) : (
                                    <FontAwesomeIcon icon={faBuildingCircleCheck} className="text-3xl text-text-secondary" />
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                                <button type="button" onClick={() => logoInputRef.current.click()} className="bg-component-bg-hover text-text-primary font-semibold px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm flex items-center justify-center gap-2 border border-border-color">
                                    <FontAwesomeIcon icon={faUpload} /> Cambiar
                                </button>
                                {user.logoUrl && (
                                    <button type="button" onClick={handleDeleteLogo} className="bg-component-bg-hover text-text-primary font-semibold px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm flex items-center justify-center gap-2 border border-border-color">
                                        <FontAwesomeIcon icon={faTrash} /> Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                        {logoFile && (
                            <div className="mt-4 flex justify-start">
                                <button onClick={handleSaveChanges} className="bg-component-bg-hover text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-border-color transition-colors text-sm flex items-center gap-2 border border-border-color">
                                    <FontAwesomeIcon icon={faSave} />
                                    Guardar Cambios
                                </button>
                            </div>
                        )}
                        {logoMessage.text && (
                            <p className={`text-sm mt-3 font-semibold ${logoMessage.type === 'success' ? 'text-green-accent' : (logoMessage.type === 'error' ? 'text-red-accent' : 'text-text-secondary')}`}>
                                {logoMessage.text}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">Estos son los datos de la empresa a la que perteneces. Contacta con el propietario para realizar cambios.</p>
                    <div className="space-y-3 bg-background/50 p-4 rounded-xl border border-border-color">
                        <ReadOnlyInfoItem icon={faBuilding} label="Razón Social" value={user.businessName} />
                        <ReadOnlyInfoItem icon={faIdCard} label="CIF / NIF" value={user.cif || user.dni} />
                        <ReadOnlyInfoItem icon={faMapMarkerAlt} label="Dirección" value={user.address} />
                        <ReadOnlyInfoItem icon={faPhone} label="Teléfono" value={user.phone} />
                    </div>
                     <div className="flex items-center gap-4 pt-4">
                        <h4 className="font-semibold text-text-primary">LOGO:</h4>
                        <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border-color flex-shrink-0">
                            {user.logoUrl ? (
                                <img src={`${API_BASE_URL}${user.logoUrl}`} alt="Logo" className="h-full w-full object-contain" />
                            ) : (
                                <FontAwesomeIcon icon={faBuildingCircleCheck} className="text-3xl text-text-secondary" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessDataSettings;