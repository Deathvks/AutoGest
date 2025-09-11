// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsHeader.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const CarDetailsHeader = ({ car, onClose }) => (
    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
        <div>
            <h2 className="text-2xl font-bold text-text-primary">{car.make} {car.model}</h2>
            <p className="text-sm text-text-secondary">{car.licensePlate}</p>
        </div>
        <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
        </button>
    </div>
);

export default CarDetailsHeader;