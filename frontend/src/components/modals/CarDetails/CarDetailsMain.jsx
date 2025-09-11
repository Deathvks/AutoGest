// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsMain.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt, faTachometerAlt, faGasPump, faCogs, faBolt, faShieldAlt,
    faIdCard, faFingerprint, faMapMarkerAlt, faTags, faFileLines, faKey // --- INICIO DE LA MODIFICACIÓN ---
} from '@fortawesome/free-solid-svg-icons';
import { DetailItem, MultiFileLinks } from './CarDetailsUtils';

const CarDetailsMain = ({ car }) => {
    let tagsToShow = [];
    if (typeof car.tags === 'string') {
        try {
            tagsToShow = JSON.parse(car.tags);
        } catch (e) { tagsToShow = []; }
    } else if (Array.isArray(car.tags)) {
        tagsToShow = car.tags;
    }

    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">DETALLES PRINCIPALES</h3>
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={faCalendarAlt} label="FECHA DE MATRICULACIÓN" value={car.registrationDate ? new Date(car.registrationDate).toLocaleDateString('es-ES') : 'N/A'} />
                    <DetailItem icon={faTachometerAlt} label="KILOMETRAJE" value={car.km ? `${new Intl.NumberFormat('es-ES').format(car.km)} KM` : 'N/A'} />
                    <DetailItem icon={faGasPump} label="COMBUSTIBLE" value={car.fuel} />
                    <DetailItem icon={faCogs} label="TRANSMISIÓN" value={car.transmission} />
                    <DetailItem icon={faBolt} label="POTENCIA" value={car.horsepower ? `${car.horsepower} CV` : 'N/A'} />
                    <div className="flex flex-col">
                        <div className="flex items-center text-sm text-text-secondary mb-1">
                            <FontAwesomeIcon icon={faShieldAlt} className={`w-4 h-4 mr-2 ${!car.hasInsurance ? 'text-red-accent' : ''}`} />
                            <span>SEGURO</span>
                        </div>
                        <p className="font-semibold text-text-primary break-words">{car.hasInsurance ? 'SÍ' : 'NO'}</p>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">IDENTIFICACIÓN Y DOCUMENTOS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailItem icon={faIdCard} label="MATRÍCULA" value={car.licensePlate} />
                    <DetailItem icon={faFingerprint} label="Nº DE BASTIDOR" value={car.vin} />
                    <DetailItem icon={faMapMarkerAlt} label="UBICACIÓN" value={car.location} />
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <DetailItem icon={faKey} label="Nº DE LLAVES" value={car.keys || '1'} />
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                    <MultiFileLinks label="FICHA TÉCNICA" icon={faFileLines} filesData={car.technicalSheetUrl} />
                    <MultiFileLinks label="PERMISO DE CIRCULACIÓN" icon={faFileLines} filesData={car.registrationCertificateUrl} />
                    <MultiFileLinks label="ARCHIVOS VARIOS" filesData={car.otherDocumentsUrls} />
                </div>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">ETIQUETAS</h3>
                <div className="flex flex-wrap gap-2">
                    {tagsToShow.length > 0 ? tagsToShow.map(tag => (
                        <span key={tag} className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                    )) : <p className="text-text-primary text-sm font-semibold">SIN ETIQUETAS</p>}
                </div>
            </section>
        </div>
    );
};

export default CarDetailsMain;