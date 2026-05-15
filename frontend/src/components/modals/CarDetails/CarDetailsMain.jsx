// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsMain.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt, faTachometerAlt, faGasPump, faCogs, faBolt, faShieldAlt,
    faIdCard, faFingerprint, faMapMarkerAlt, faFileLines, faKey
} from '@fortawesome/free-solid-svg-icons';
import { DetailItem, MultiFileLinks, ReservationFileLink } from './CarDetailsUtils';

const CarDetailsMain = ({ car, onDeleteFile }) => {
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
                <h3 className="text-[13px] font-bold text-[#6B7280] mb-4 uppercase tracking-wider border-b border-[#E5E7EB] pb-2">Detalles Principales</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                    <DetailItem icon={faCalendarAlt} label="Matriculación" value={car.registrationDate ? new Date(car.registrationDate).toLocaleDateString('es-ES') : 'N/A'} />
                    <DetailItem icon={faTachometerAlt} label="Kilometraje" value={car.km ? `${new Intl.NumberFormat('es-ES').format(car.km)} KM` : 'N/A'} />
                    <DetailItem icon={faGasPump} label="Combustible" value={displayValue(car.fuel)} />
                    <DetailItem icon={faCogs} label="Transmisión" value={displayValue(car.transmission)} />
                    <DetailItem icon={faBolt} label="Potencia" value={car.horsepower ? `${car.horsepower} CV` : 'N/A'} />
                    <div className="flex flex-col">
                        <div className="flex items-center text-[12px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                            <FontAwesomeIcon icon={faShieldAlt} className={`w-3.5 h-3.5 mr-2 ${!car.hasInsurance ? 'text-[#DC2626]' : 'text-[#020B1C]'}`} />
                            <span>Seguro</span>
                        </div>
                        <p className="font-bold text-[#06122A] break-words uppercase text-[15px]">{car.hasInsurance ? 'Sí' : 'No'}</p>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-[13px] font-bold text-[#6B7280] mb-4 uppercase tracking-wider border-b border-[#E5E7EB] pb-2">Identificación y Documentos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <DetailItem icon={faIdCard} label="Matrícula" value={car.licensePlate || 'N/A'} />
                    <DetailItem icon={faFingerprint} label="Nº de Bastidor" value={car.vin || 'N/A'} />
                    <DetailItem icon={faMapMarkerAlt} label="Ubicación" value={car.location || 'N/A'} />
                    <DetailItem icon={faKey} label="Nº de Llaves" value={car.keys || '1'} />

                    <ReservationFileLink car={car} />

                    <MultiFileLinks label="Ficha Técnica" icon={faFileLines} filesData={car.technicalSheetUrl} car={car} fileType="technicalSheet" onDeleteFile={onDeleteFile} />
                    <MultiFileLinks label="Permiso de Circulación" icon={faFileLines} filesData={car.registrationCertificateUrl} car={car} fileType="registrationCertificate" onDeleteFile={onDeleteFile} />
                    <MultiFileLinks label="Archivos Varios" filesData={car.otherDocumentsUrls} car={car} fileType="otherDocuments" onDeleteFile={onDeleteFile} />
                </div>
            </section>

            {tagsToShow.length > 0 && (
                <section>
                    <h3 className="text-[13px] font-bold text-[#6B7280] mb-4 uppercase tracking-wider border-b border-[#E5E7EB] pb-2">Etiquetas</h3>
                    <div className="flex flex-wrap gap-2">
                        {tagsToShow.map(tag => (
                            <span key={tag} className="bg-[#F2F4F8] text-[#06122A] border border-[#E5E7EB] text-[12px] font-bold px-3 py-1.5 rounded-[10px] uppercase tracking-wide">
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default CarDetailsMain;