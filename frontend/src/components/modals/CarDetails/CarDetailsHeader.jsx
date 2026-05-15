// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsHeader.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const CarDetailsHeader = ({ car, onClose }) => (
    <div className="flex-shrink-0 flex justify-between items-start px-6 py-6 bg-[#020B1C] text-white relative z-20">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">{car.make} {car.model}</h2>
            <div className="flex items-center gap-3 mt-2">
                <span className="text-[13px] font-bold bg-[#F2F4F8] text-[#020B1C] px-3 py-1 rounded-[10px] tracking-wide">
                    {car.licensePlate}
                </span>
                {car.vin && (
                    <span className="text-[13px] font-medium text-white/70 tracking-wide">
                        VIN: {car.vin}
                    </span>
                )}
            </div>
        </div>
        <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 focus:outline-none"
            aria-label="Cerrar detalle"
        >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
        </button>
    </div>
);

export default CarDetailsHeader;