// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsMain.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt, faTachometerAlt, faGasPump, faCogs, faBolt, faShieldAlt,
    faIdCard, faFingerprint, faMapMarkerAlt, faTags, faFileLines, faKey
} from '@fortawesome/free-solid-svg-icons';
import { DetailItem, MultiFileLinks } from './CarDetailsUtils';

// --- INICIO DE LA MODIFICACIÓN ---
const CarDetailsMain = ({ car }) => {
    let tagsToShow = [];
    if (typeof car.tags === 'string') {
        try {
            tagsToShow = JSON.parse(car.tags);
        } catch (e) { tagsToShow = []; }
    } else if (Array.isArray(car.tags)) {
        tagsToShow = car.tags;
    }

    const displayValue = (value) => (value && String(value).toUpperCase() !== 'NULL' ? value : 'No especificado');

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2 uppercase">Detalles Principales</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    <DetailItem icon={faCalendarAlt} label="Matriculación" value={car.registrationDate ? new Date(car.registrationDate).toLocaleDateString('es-ES') : 'N/A'} />
                    <DetailItem icon={faTachometerAlt} label="Kilometraje" value={car.km ? `${new Intl.NumberFormat('es-ES').format(car.km)} KM` : 'N/A'} />
                    <DetailItem icon={faGasPump} label="Combustible" value={displayValue(car.fuel)} />
                    <DetailItem icon={faCogs} label="Transmisión" value={displayValue(car.transmission)} />
                    <DetailItem icon={faBolt} label="Potencia" value={car.horsepower ? `${car.horsepower} CV` : 'N/A'} />
                    <div className="flex flex-col">
                        <div className="flex items-center text-sm text-text-secondary mb-1 uppercase">
                            <FontAwesomeIcon icon={faShieldAlt} className={`w-4 h-4 mr-2 ${!car.hasInsurance ? 'text-red-accent' : ''}`} />
                            <span>Seguro</span>
                        </div>
                        <p className="font-semibold text-text-primary break-words uppercase">{car.hasInsurance ? 'Sí' : 'No'}</p>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2 uppercase">Identificación y Documentos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                    <DetailItem icon={faIdCard} label="Matrícula" value={car.licensePlate || 'N/A'} />
                    <DetailItem icon={faFingerprint} label="Nº de Bastidor" value={car.vin || 'N/A'} />
                    <DetailItem icon={faMapMarkerAlt} label="Ubicación" value={car.location || 'N/A'} />
                    <DetailItem icon={faKey} label="Nº de Llaves" value={car.keys || '1'} />
                    <MultiFileLinks label="Ficha Técnica" icon={faFileLines} filesData={car.technicalSheetUrl} />
                    <MultiFileLinks label="Permiso de Circulación" icon={faFileLines} filesData={car.registrationCertificateUrl} />
                    <MultiFileLinks label="Archivos Varios" filesData={car.otherDocumentsUrls} />
                </div>
            </section>

            {tagsToShow.length > 0 && (
                <section>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2 uppercase">Etiquetas</h3>
                    <div className="flex flex-wrap gap-2">
                        {tagsToShow.map(tag => (
                            <span key={tag} className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full uppercase">{tag}</span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
// --- FIN DE LA MODIFICACIÓN ---

export default CarDetailsMain;