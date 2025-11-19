// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsHeader.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const CarDetailsHeader = ({ car, onClose }) => (
    <div className="flex-shrink-0 flex justify-between items-start px-8 py-6 bg-accent text-white relative z-20"> {/* Fondo rojo y texto blanco */}
        <div>
            <h2 className="text-3xl font-extrabold uppercase tracking-tight">{car.make} {car.model}</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold bg-white text-accent px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                    {car.licensePlate}
                </span>
                {car.vin && (
                    <span className="text-xs font-medium text-red-100 uppercase tracking-wider">
                        VIN: {car.vin}
                    </span>
                )}
            </div>
        </div>
        <button 
            onClick={onClose} 
            className="text-white/60 hover:text-white transition-colors p-1 focus:outline-none" // Modificado: sin fondo ni padding extra
            aria-label="Cerrar detalle"
        >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
        </button>
    </div>
);

export default CarDetailsHeader;