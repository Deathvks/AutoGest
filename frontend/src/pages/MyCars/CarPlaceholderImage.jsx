// autogest-app/frontend/src/pages/MyCars/CarPlaceholderImage.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const CarPlaceholderImage = ({ car, size }) => {
    const { activeTheme } = useContext(ThemeContext);

    // Generar iniciales
    const makeInitial = car.make ? car.make.charAt(0).toUpperCase() : '';
    const modelInitial = car.model ? car.model.charAt(0).toUpperCase() : '';
    const initials = `${makeInitial}${modelInitial}`;

    // Usar el background del tema para el degradado del placeholder
    const backgroundStyle = {
        background: activeTheme.circlesBg, // Usamos el color de los círculos para un degradado
    };

    const textSizeClass = size === 'small' ? 'text-2xl' : 'text-4xl sm:text-5xl';

    return (
        <div
            // CAMBIO: text-white a text-gray-300 para que las letras sean grises
            className={`w-full h-full flex items-center justify-center font-extrabold text-gray-300 ${textSizeClass}`}
            style={backgroundStyle}
        >
            {initials}
        </div>
    );
};

export default CarPlaceholderImage;