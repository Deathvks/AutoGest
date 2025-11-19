// autogest-app/frontend/src/components/modals/CarDetailsModalContent.jsx
import React from 'react';
import CarDetailsHeader from './CarDetails/CarDetailsHeader';
import CarDetailsInfo from './CarDetails/CarDetailsInfo';
import CarDetailsMain from './CarDetails/CarDetailsMain';
import CarDetailsSections from './CarDetails/CarDetailsSections';
import CarDetailsActions from './CarDetails/CarDetailsActions';

const CarDetailsModalContent = (props) => {
    const { car } = props;

    if (!car) return null;

    return (
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden relative">
            {/* La franja roja superior se ha eliminado porque el header ahora es completamente rojo */}

            <CarDetailsHeader {...props} />

            <div className="flex-grow overflow-y-auto p-8 space-y-8 no-scrollbar bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <CarDetailsInfo {...props} />
                    </div>
                    <div className="lg:col-span-2">
                        <CarDetailsMain {...props} />
                    </div>
                </div>
                <div className="pt-8 border-t border-gray-100">
                    <CarDetailsSections {...props} />
                </div>
            </div>
            
            <CarDetailsActions {...props} />
        </div>
    );
};

export default CarDetailsModalContent;