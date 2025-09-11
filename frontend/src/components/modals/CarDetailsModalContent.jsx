// autogest-app/frontend/src/components/modals/CarDetailsModalContent.jsx
import React from 'react';
import CarDetailsHeader from './CarDetails/CarDetailsHeader';
import CarDetailsInfo from './CarDetails/CarDetailsInfo';
import CarDetailsMain from './CarDetails/CarDetailsMain';
import CarDetailsSections from './CarDetails/CarDetailsSections';
import CarDetailsActions from './CarDetails/CarDetailsActions';

const CarDetailsModalContent = (props) => {
    const { car, onClose } = props;

    if (!car) return null;

    return (
        <div className="bg-component-bg rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <CarDetailsHeader car={car} onClose={onClose} />

            <div className="flex-grow overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <CarDetailsInfo car={car} />
                    <CarDetailsMain car={car} />
                </div>
                <CarDetailsSections {...props} />
            </div>
            
            <CarDetailsActions {...props} />
        </div>
    );
};

export default CarDetailsModalContent;