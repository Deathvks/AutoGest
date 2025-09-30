// autogest-app/frontend/src/pages/Settings/BusinessDataSettings.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUpload, faTrash, faBuildingCircleCheck, faSave, faIdCard, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

// --- Componente interno para la vista de solo lectura ---
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

    // --- INICIO DE LA MODIFICACIÓN ---
    // Un usuario normal sin empresa no ve esta sección.
    if (user.role === 'user' && !user.companyId) {
        return null;
    }

    // Solo pueden editar los administradores o los propietarios de un equipo.
    const canEdit = user.role === 'admin' || user.isOwner;
    // --- FIN DE LA MODIFICACIÓN ---

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
            updateUserProfile({ ...user, logoUrl: null }); // Actualiza el contexto localmente
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

    return (
        <div className="p-6 bg-component-bg rounded-xl border border-border-color">
            <h3 className="text-lg font-bold text-text-primary mb-4">DATOS DE EMPRESA</h3>
            
            {canEdit ? (
                <>
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
                    <hr className="border-border-color my-6" />
                    <h4 className="font-semibold text-text-primary mb-2">LOGO DE LA EMPRESA</h4>
                    <p className="text-sm text-text-secondary mb-3">SUBE EL LOGO DE TU EMPRESA PARA QUE APAREZCA EN TUS FACTURAS. (MÁX 10MB)</p>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border-color flex-shrink-0">
                            {logoPreview ? (
                                <img src={logoPreview.startsWith('blob:') ? logoPreview : `${API_BASE_URL}${logoPreview}`} alt="Logo" className="h-full w-full object-contain" />
                            ) : (
                                <FontAwesomeIcon icon={faBuildingCircleCheck} className="text-3xl text-text-secondary" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                            <button type="button" onClick={() => logoInputRef.current.click()} className="bg-component-bg-hover text-text-secondary px-3 py-2 rounded-lg hover:bg-border-color transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-border-color">
                                <FontAwesomeIcon icon={faUpload} /> CAMBIAR LOGO
                            </button>
                            {user.logoUrl && (
                                <button type="button" onClick={handleDeleteLogo} className="bg-red-accent/10 text-red-accent px-3 py-2 rounded-lg hover:bg-red-accent/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-transparent">
                                    <FontAwesomeIcon icon={faTrash} /> ELIMINAR LOGO
                                </button>
                            )}
                        </div>
                    </div>
                    {logoFile && (
                        <div className="mt-4 flex justify-start">
                            <button onClick={handleSaveChanges} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2">
                                <FontAwesomeIcon icon={faSave} />
                                GUARDAR CAMBIOS
                            </button>
                        </div>
                    )}
                    {logoMessage.text && (
                        <p className={`text-sm mt-3 ${logoMessage.type === 'success' ? 'text-green-accent' : (logoMessage.type === 'error' ? 'text-red-accent' : 'text-text-secondary')}`}>
                            {logoMessage.text}
                        </p>
                    )}
                </>
            ) : (
                <>
                    <p className="text-sm text-text-secondary mb-4">Estos son los datos de la empresa a la que perteneces. Contacta con el propietario para realizar cambios.</p>
                    <div className="space-y-3 bg-background p-4 rounded-lg border border-border-color">
                        <ReadOnlyInfoItem icon={faBuilding} label="Razón Social" value={user.businessName} />
                        <ReadOnlyInfoItem icon={faIdCard} label="CIF / NIF" value={user.cif || user.dni} />
                        <ReadOnlyInfoItem icon={faMapMarkerAlt} label="Dirección" value={user.address} />
                        <ReadOnlyInfoItem icon={faPhone} label="Teléfono" value={user.phone} />
                    </div>
                     <hr className="border-border-color my-6" />
                     <h4 className="font-semibold text-text-primary mb-2">LOGO DE LA EMPRESA</h4>
                     <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border-color flex-shrink-0">
                            {user.logoUrl ? (
                                <img src={`${API_BASE_URL}${user.logoUrl}`} alt="Logo" className="h-full w-full object-contain" />
                            ) : (
                                <FontAwesomeIcon icon={faBuildingCircleCheck} className="text-3xl text-text-secondary" />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BusinessDataSettings;