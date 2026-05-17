// autogest-app/frontend/src/components/modals/CarDetailsModalContent.jsx
import React, { useState, useEffect } from 'react';
import { FastAverageColor } from 'fast-average-color';
import CarDetailsHeader from './CarDetails/CarDetailsHeader';
import CarDetailsInfo from './CarDetails/CarDetailsInfo';
import CarDetailsMain from './CarDetails/CarDetailsMain';
import CarDetailsSections from './CarDetails/CarDetailsSections';
import CarDetailsActions from './CarDetails/CarDetailsActions';

const CarDetailsModalContent = (props) => {
    const { car } = props;
    const [dominantColor, setDominantColor] = useState('rgba(255, 255, 255, 1)');

    // Extraemos el color aquí para teñir TODO el modal, no solo la imagen
    useEffect(() => {
        if (car && car.imageUrl) {
            const fac = new FastAverageColor();
            fac.getColorAsync(car.imageUrl, { algorithm: 'dominant' })
                .then(color => {
                    setDominantColor(`rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 1)`);
                })
                .catch(e => console.log('Error al extraer color:', e));
        }
    }, [car]);

    if (!car) return null;

    return (
        <div
            className="rounded-[24px] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/20 overflow-hidden relative transition-colors duration-1000"
            style={{
                // El fondo de TODO el modal se tiñe suavemente con el color dominante
                background: `linear-gradient(to bottom, ${dominantColor.replace(', 1)', ', 0.15)')} 0%, #FFFFFF 60%)`
            }}
        >
            <CarDetailsHeader {...props} />

            {/* El contenedor principal con scroll */}
            <div className="flex-grow overflow-y-auto no-scrollbar flex flex-col">

                {/* HÉROE (Imagen gigante y precio) - Ahora ocupa el 100% del ancho arriba */}
                <div className="w-full">
                    {/* Le pasamos el color dominante para la cabecera */}
                    <CarDetailsInfo {...props} dominantColor={dominantColor} />
                </div>

                {/* RESTO DEL CONTENIDO - Justo debajo del héroe */}
                <div className="px-8 pb-8 space-y-8 flex-grow">
                    <CarDetailsMain {...props} />

                    <div className="pt-8 border-t border-gray-200/60">
                        <CarDetailsSections {...props} />
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md border-t border-gray-200/60 z-20 relative">
                <CarDetailsActions {...props} />
            </div>
        </div>
    );
};

export default CarDetailsModalContent;