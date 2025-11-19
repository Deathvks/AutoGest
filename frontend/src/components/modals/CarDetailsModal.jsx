// autogest-app/frontend/src/components/modals/CarDetailsModal.jsx
import React from 'react';
import CarDetailsModalContent from './CarDetailsModalContent';

const CarDetailsModal = (props) => {
    const { car, onClose } = props;

    if (!car) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up" 
            onClick={onClose}
        >
            <div 
                className="w-full max-w-5xl max-h-[90vh] flex" 
                onClick={e => e.stopPropagation()}
            >
                <CarDetailsModalContent {...props} />
            </div>
        </div>
    );
};

export default CarDetailsModal;