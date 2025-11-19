// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsInfo.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';
import CarPlaceholderImage from '../../../pages/MyCars/CarPlaceholderImage';

const getStatusChipClass = (status) => {
    switch (status) {
        case 'Vendido': return 'bg-green-100 text-green-800 border border-green-200';
        case 'En venta': return 'bg-blue-100 text-blue-800 border border-blue-200';
        case 'Reservado': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
};

const CarDetailsInfo = ({ car }) => {
    const { user } = useContext(AuthContext);
    const [remainingTime, setRemainingTime] = useState('');
    const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();

    const canViewSensitiveData = user.role === 'admin' || user.isOwner || !user.companyId;

    useEffect(() => {
        if (!isReservedAndActive) return;

        const interval = setInterval(() => {
            const now = new Date();
            const expiry = new Date(car.reservationExpiry);
            const diff = expiry - now;

            if (diff <= 0) {
                setRemainingTime('Expirado');
                clearInterval(interval);
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);

            let timeString = '';
            if (d > 0) timeString += `${d}d `;
            if (h > 0 || d > 0) timeString += `${h}h `;
            timeString += `${m}m`;

            setRemainingTime(timeString.trim());
        }, 1000);

        return () => clearInterval(interval);
    }, [car.reservationExpiry, isReservedAndActive]);

    return (
        <div className="space-y-6">
            {/* Contenedor de Imagen */}
            <div className="w-full h-auto aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                {car.imageUrl ? (
                    <img
                        src={car.imageUrl}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <CarPlaceholderImage car={car} />
                )}
            </div>

            {/* Panel de Precio y Estado */}
            <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200 shadow-sm">
                <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Precio Venta Final</p>
                    {/* Reducido el tamaño de texto aquí */}
                    <p className="text-3xl lg:text-4xl font-extrabold text-accent tracking-tight">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice || car.price)}
                    </p>
                    
                    {canViewSensitiveData && (
                        <p className="text-sm font-medium text-gray-400 mt-2 uppercase">
                            Compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                        </p>
                    )}
                    
                    {car.status === 'Reservado' && car.reservationDeposit > 0 && (
                        <p className="text-sm font-semibold text-yellow-600 mt-2 uppercase bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                            Reserva: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.reservationDeposit)}
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <span className={`inline-block text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wide ${getStatusChipClass(car.status)}`}>
                        {car.status} {car.saleDate ? ` - ${new Date(car.saleDate).toLocaleDateString('es-ES')}` : ''}
                    </span>
                </div>

                {isReservedAndActive && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded border border-yellow-200 w-fit mx-auto uppercase">
                        <FontAwesomeIcon icon={faClock} />
                        <span>Quedan: {remainingTime}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarDetailsInfo;