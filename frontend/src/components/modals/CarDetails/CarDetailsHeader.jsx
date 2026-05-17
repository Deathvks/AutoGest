// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsHeader.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const CarDetailsHeader = ({ car, onClose }) => (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-8 py-6 text-white z-40 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
            <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-md uppercase">{car.make} {car.model}</h2>
            <div className="flex items-center gap-3 mt-2">
                <span className="text-[12px] font-bold bg-white text-[#020B1C] px-2.5 py-1 rounded-[8px] tracking-wide shadow-sm uppercase">
                    {car.licensePlate}
                </span>
                {car.vin && (
                    <span className="text-[13px] font-bold text-white drop-shadow-sm tracking-wide uppercase">
                        VIN: {car.vin}
                    </span>
                )}
            </div>
        </div>
        <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-all p-2 focus:outline-none hover:scale-110 pointer-events-auto bg-black/20 hover:bg-black/40 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm"
            aria-label="Cerrar detalle"
        >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
        </button>
    </div>
);

export default CarDetailsHeader;