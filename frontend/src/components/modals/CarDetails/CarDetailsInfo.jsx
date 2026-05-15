// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsInfo.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';
import CarPlaceholderImage from '../../../pages/MyCars/CarPlaceholderImage';

const getStatusChipClass = (status) => {
    switch (status) {
        case 'Vendido': return 'bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20';
        case 'En venta': return 'bg-[#DBEAFE] text-[#1E3A8A] border border-[#1E3A8A]/20';
        case 'Reservado': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        default: return 'bg-[#F2F4F8] text-[#6B7280] border border-[#E5E7EB]';
    }
};

const CarDetailsInfo = ({ car }) => {
    const { user } = useContext(AuthContext);
    const [remainingTime, setRemainingTime] = useState('');
    const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();

    // En el nuevo modelo B2C, el usuario siempre puede ver los datos sensibles de sus propios coches
    const canViewSensitiveData = true;

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
            <div className="w-full h-auto aspect-video bg-[#F2F4F8] rounded-[20px] border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
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
            <div className="bg-[#F2F4F8] p-6 rounded-[20px] text-center border border-[#E5E7EB]">
                <div className="flex flex-col items-center">
                    <p className="text-[13px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Precio Venta Final</p>
                    <p className="text-3xl lg:text-4xl font-bold text-[#06122A] tracking-tight">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice || car.price)}
                    </p>

                    {canViewSensitiveData && (
                        <p className="text-[14px] font-medium text-[#6B7280] mt-2 uppercase">
                            Compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                        </p>
                    )}

                    {car.status === 'Reservado' && car.reservationDeposit > 0 && (
                        <p className="text-[14px] font-medium text-yellow-700 mt-3 uppercase bg-yellow-100 px-4 py-1.5 rounded-[10px] border border-yellow-200">
                            Reserva: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.reservationDeposit)}
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <span className={`inline-block text-[13px] font-bold px-4 py-2 rounded-[10px] uppercase tracking-wide ${getStatusChipClass(car.status)}`}>
                        {car.status} {car.saleDate ? ` - ${new Date(car.saleDate).toLocaleDateString('es-ES')}` : ''}
                    </span>
                </div>

                {isReservedAndActive && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-[13px] font-bold text-yellow-800 bg-yellow-100 px-4 py-2 rounded-[10px] border border-yellow-200 w-fit mx-auto uppercase">
                        <FontAwesomeIcon icon={faClock} />
                        <span>Quedan: {remainingTime}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarDetailsInfo;