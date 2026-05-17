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

const CarDetailsInfo = ({ car, dominantColor }) => {
    const { user } = useContext(AuthContext);
    const [remainingTime, setRemainingTime] = useState('');
    const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();

    const canViewSensitiveData = true;

    // --- TEMPORIZADOR RESERVA ---
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

    const activeColor = dominantColor || 'rgba(2, 11, 28, 1)';

    return (
        <div className="flex flex-col w-full mb-8">
            {/* --- CONTENEDOR TIPO NETFLIX (HÉROE SUPERIOR) --- */}
            <div
                className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden transition-colors duration-1000 shadow-inner"
                style={{ backgroundColor: activeColor.replace(', 1)', ', 0.95)') }}
            >
                {/* 1. Imagen de fondo desenfocada */}
                {car.imageUrl && (
                    <img
                        src={car.imageUrl}
                        alt="Background blur"
                        className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-125 mix-blend-overlay"
                    />
                )}

                {/* 2. Degradado inferior para fundir con el color de fondo del modal */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20" />

                {/* 3. Imagen nítida del coche forzada al 90% del width */}
                <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-4">
                    {car.imageUrl ? (
                        <img
                            src={car.imageUrl}
                            alt={`${car.make} ${car.model}`}
                            className="w-[90%] max-w-3xl h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] transition-transform hover:scale-105 duration-700 ease-out"
                        />
                    ) : (
                        <div className="w-[90%] max-w-3xl h-[75%] flex items-center justify-center bg-white/10 backdrop-blur-md rounded-[20px] border border-white/10">
                            <CarPlaceholderImage car={car} />
                        </div>
                    )}
                </div>
            </div>

            {/* --- PANEL DE PRECIO Y ESTADO --- */}
            <div className="px-8 -mt-10 relative z-30">
                <div className="bg-white p-6 rounded-[20px] border border-gray-200/80 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
                    <div>
                        <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest mb-0.5">Precio Venta Final</p>
                        <p className="text-3xl font-extrabold text-[#06122A] tracking-tight">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.salePrice || car.price)}
                        </p>
                        {canViewSensitiveData && (
                            <p className="text-[13px] font-semibold text-[#6B7280] mt-0.5 uppercase">
                                Compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.purchasePrice)}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:items-end justify-center gap-2">
                        <span className={`inline-block text-[12px] font-bold px-4 py-2 rounded-[10px] uppercase tracking-wider ${getStatusChipClass(car.status)}`}>
                            {car.status} {car.saleDate ? ` - ${new Date(car.saleDate).toLocaleDateString('es-ES')}` : ''}
                        </span>

                        {isReservedAndActive && (
                            <div className="flex items-center justify-center gap-2 text-[12px] font-bold text-yellow-800 bg-yellow-100 px-3 py-1.5 rounded-[8px] border border-yellow-200 uppercase shadow-sm">
                                <FontAwesomeIcon icon={faClock} />
                                <span>Quedan: {remainingTime}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarDetailsInfo;