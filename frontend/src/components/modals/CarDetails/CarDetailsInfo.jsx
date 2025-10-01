// autogest-app/frontend/src/components/modals/CarDetails/CarDetailsInfo.jsx
import React, { useState, useEffect, useContext } from 'react'; // <-- Importar useContext
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext'; // <-- Importar el contexto

const getStatusChipClass = (status) => {
    switch (status) {
        case 'Vendido': return 'bg-green-accent/10 text-green-accent';
        case 'En venta': return 'bg-blue-accent/10 text-blue-accent';
        case 'Reservado': return 'bg-yellow-accent/10 text-yellow-accent';
        default: return 'bg-component-bg-hover text-text-secondary';
    }
};

const CarDetailsInfo = ({ car }) => {
    const { user } = useContext(AuthContext); // Obtenemos el usuario del contexto
    const [remainingTime, setRemainingTime] = useState('');
    const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se elimina la URL base para que el proxy de Vite funcione en desarrollo
    const imageUrl = car.imageUrl ? car.imageUrl : `https://placehold.co/600x400/f1f3f5/6c757d?text=${car.make}+${car.model}`;
    // --- FIN DE LA MODIFICACIÓN ---

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
        <div className="space-y-4">
            <img
                src={imageUrl}
                alt={`${car.make} ${car.model}`}
                className="w-full h-auto object-cover rounded-lg border border-border-color"
            />
            <div className="bg-background p-4 rounded-lg text-center">
                <div className="flex flex-col items-center">
                    <p className="text-lg text-text-secondary uppercase">Precio Venta Final</p>
                    <p className="text-4xl font-extrabold text-accent">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice || car.price)}
                    </p>
                    {(user.role === 'admin' || user.role === 'technician' || user.role === 'technician_subscribed') && (
                        <p className="text-sm text-text-secondary mt-1 uppercase">
                            Compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                        </p>
                    )}
                    {car.status === 'Reservado' && car.reservationDeposit > 0 && (
                        <p className="text-sm font-semibold text-yellow-accent mt-1 uppercase">
                            Reserva: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.reservationDeposit)}
                        </p>
                    )}
                </div>
                <span className={`mt-2 inline-block text-sm font-bold px-3 py-1 rounded-full ${getStatusChipClass(car.status)} uppercase`}>
                    {car.status} {car.saleDate ? ` - ${new Date(car.saleDate).toLocaleDateString('es-ES')}` : ''}
                </span>
                {isReservedAndActive && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-yellow-accent bg-yellow-accent/10 px-3 py-1 rounded-md uppercase">
                        <FontAwesomeIcon icon={faClock} />
                        <span>Quedan: {remainingTime}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarDetailsInfo;