// autogest-app/frontend/src/pages/MyCars/CarCard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faRoad, faGasPump, faCogs, faHandHoldingUsd, faBell, faBan, faTags, faShieldAlt, faExclamationTriangle, faClock } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${enabled ? 'bg-accent' : 'bg-zinc-200 dark:bg-zinc-700'}`}
  >
    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const CarCard = ({ car, onViewDetailsClick, onSellClick, onReserveClick, onCancelReservationClick, onUpdateInsurance, onAddIncidentClick }) => {
  const { user } = useContext(AuthContext);
  const [remainingTime, setRemainingTime] = useState('');

  const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
  const isLockedForUser = isReservedAndActive && user.role !== 'admin';

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


  const getStatusChipClass = (status) => {
    switch (status) {
      case 'Vendido': return 'bg-green-accent/10 text-green-accent';
      case 'En venta': return 'bg-blue-accent/10 text-blue-accent';
      case 'Reservado': return 'bg-yellow-accent/10 text-yellow-accent';
      default: return 'bg-component-bg-hover text-text-secondary';
    }
  };

  let tagsToShow = [];
  if (typeof car.tags === 'string') {
    try { tagsToShow = JSON.parse(car.tags); } catch { tagsToShow = []; }
  } else if (Array.isArray(car.tags)) {
    tagsToShow = car.tags;
  }

  const visibleTags = tagsToShow.slice(0, 3);
  const hiddenTagsCount = tagsToShow.length - visibleTags.length;
  const imageUrl = car.imageUrl ? `${API_BASE_URL}${car.imageUrl}` : `https://placehold.co/400x300/f1f3f5/6c757d?text=${car.make}+${car.model}`;

  return (
    <div className={`bg-component-bg rounded-lg shadow-sm border border-border-color overflow-hidden flex flex-col sm:flex-row transition-all duration-300 hover:shadow-lg ${isLockedForUser ? 'opacity-70' : ''}`}>
      <div className="flex-shrink-0 w-full aspect-square overflow-hidden sm:w-48 sm:aspect-[4/3] lg:w-60 lg:aspect-[4/3]">
        <img
          src={imageUrl}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover object-center cursor-pointer"
          onClick={() => onViewDetailsClick(car)}
        />
      </div>

      <div className="p-4 flex-grow flex flex-col min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-xl font-bold text-text-primary truncate">{car.make} {car.model}</h3>
            <p className="text-sm text-text-secondary">{car.licensePlate}</p>
            {isReservedAndActive && (
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-yellow-accent">
                    <FontAwesomeIcon icon={faClock} />
                    <span>Quedan: {remainingTime}</span>
                </div>
            )}
          </div>
          <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${getStatusChipClass(car.status)} ml-2`}>
            {car.status}
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm text-text-secondary my-4">
          <div className="flex items-center gap-2 truncate" title={`${new Intl.NumberFormat('es-ES').format(car.km)} km`}>
            <FontAwesomeIcon icon={faRoad} className="w-4 h-4" />
            <span>{car.km ? `${new Intl.NumberFormat('es-ES').format(car.km)} km` : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 truncate" title={car.registrationDate ? new Date(car.registrationDate).getFullYear().toString() : 'N/A'}>
            <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
            <span>{car.registrationDate ? new Date(car.registrationDate).getFullYear() : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 truncate" title={car.fuel || 'N/A'}>
            <FontAwesomeIcon icon={faGasPump} className="w-4 h-4" />
            <span>{car.fuel || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 truncate" title={car.transmission || 'N/A'}>
            <FontAwesomeIcon icon={faCogs} className="w-4 h-4" />
            <span>{car.transmission || 'N/A'}</span>
          </div>
          {/* --- INICIO DE LA MODIFICACIÓN --- */}
          <div className="flex items-center gap-2" title={`Seguro: ${car.hasInsurance ? 'Sí' : 'No'}`}>
            <FontAwesomeIcon 
              icon={faShieldAlt} 
              className={`w-4 h-4 flex-shrink-0 ${car.hasInsurance ? 'text-text-secondary' : 'text-red-accent'}`} 
            />
            <ToggleSwitch enabled={car.hasInsurance} onChange={() => onUpdateInsurance(car, !car.hasInsurance)} />
          </div>
          {/* --- FIN DE LA MODIFICACIÓN --- */}
        </div>

        {tagsToShow.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faTags} className="w-4 h-4 text-text-secondary" />
            {visibleTags.map(tag => (
              <span key={tag} className="bg-accent/10 text-accent text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>
            ))}
            {hiddenTagsCount > 0 && (
              <span className="text-xs font-semibold text-text-secondary px-2 py-1 rounded-full bg-component-bg-hover">+{hiddenTagsCount} más</span>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border-color">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <p className="text-xs text-text-secondary">Precio Venta</p>
            <p className="text-3xl font-extrabold text-accent">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}
            </p>
            <p className="text-xs text-text-secondary mt-2">
              Compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
            </p>
            {car.status === 'Vendido' && car.salePrice > 0 && (
              <p className="text-sm font-semibold text-green-accent mt-1">
                Venta Final: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}
              </p>
            )}
            {car.status === 'Reservado' && car.reservationDeposit > 0 && (
              <p className="text-sm font-semibold text-yellow-accent mt-1">
                Reserva: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.reservationDeposit)}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={() => onViewDetailsClick(car)}
              className="flex-1 sm:flex-initial bg-component-bg-hover text-accent font-semibold py-2 px-4 rounded-lg border border-border-color hover:bg-border-color transition-colors"
            >
              Detalles
            </button>
            {car.status === 'Vendido' && (
              <button onClick={() => onAddIncidentClick(car)} className="p-2 aspect-square text-accent bg-accent/10 rounded-lg hover:bg-accent/20 flex items-center justify-center transition-colors" title="Añadir Incidencia">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </button>
            )}
            {(car.status === 'En venta' || car.status === 'Reservado') && (
              <button onClick={() => onSellClick(car)} disabled={isLockedForUser} className="p-2 aspect-square text-green-accent bg-green-accent/10 rounded-lg hover:bg-green-accent/20 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Vender">
                <FontAwesomeIcon icon={faHandHoldingUsd} />
              </button>
            )}
            {car.status === 'En venta' && (
              <button onClick={() => onReserveClick(car)} disabled={isLockedForUser} className="p-2 aspect-square text-yellow-accent bg-yellow-accent/10 rounded-lg hover:bg-yellow-accent/20 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Reservar">
                <FontAwesomeIcon icon={faBell} />
              </button>
            )}
            {car.status === 'Reservado' && (
              <button onClick={() => onCancelReservationClick(car)} className="p-2 aspect-square text-red-accent bg-red-accent/10 rounded-lg hover:bg-red-accent/20 flex items-center justify-center transition-colors" title="Cancelar Reserva">
                <FontAwesomeIcon icon={faBan} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;