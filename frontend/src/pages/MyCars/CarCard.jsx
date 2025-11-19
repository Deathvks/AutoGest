// autogest-app/frontend/src/pages/MyCars/CarCard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faRoad, faGasPump, faCogs, faHandHoldingUsd, faBell, faBan, faShieldAlt, faExclamationTriangle, faClock, faKey } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import CarPlaceholderImage from './CarPlaceholderImage';

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${enabled ? 'bg-accent' : 'bg-gray-200'}`}
  >
    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const CarCard = ({ car, onViewDetailsClick, onSellClick, onReserveClick, onCancelReservationClick, onUpdateInsurance, onAddIncidentClick }) => {
  const { user } = useContext(AuthContext);
  const [remainingTime, setRemainingTime] = useState('');

  const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
  const isLockedForUser = isReservedAndActive && user.role !== 'admin';
  
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
        
        const parts = [];
        if (d > 0) parts.push(`${d}d`);
        if (h > 0) parts.push(`${h}h`);
        if (m > 0 || (d === 0 && h === 0)) {
            parts.push(`${m}m`);
        }
        
        setRemainingTime(parts.join(' '));
    }, 1000);

    return () => clearInterval(interval);
  }, [car.reservationExpiry, isReservedAndActive]);


  const getStatusChipClass = (status) => {
    switch (status) {
      case 'Vendido': return 'bg-green-100 text-green-700 border border-green-200';
      case 'En venta': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Reservado': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Taller': return 'bg-gray-100 text-gray-600 border border-gray-200';
      default: return 'bg-gray-50 text-gray-500 border border-gray-200';
    }
  };
  
  const displayValue = (value) => (value && String(value).toUpperCase() !== 'NULL' ? value : 'N/A');

  return (
    <div 
        className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row transition-all duration-300 hover:shadow-md hover:border-accent relative group ${isLockedForUser ? 'opacity-60' : ''}`}
        onClick={() => onViewDetailsClick(car)}
    >
      {/* Franja roja lateral estilo Occident */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent z-10"></div>

      <div className="flex-shrink-0 w-full md:w-56 lg:w-64 h-48 md:h-auto relative bg-gray-100 pl-1">
        {car.imageUrl ? (
            <img
              src={car.imageUrl}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover object-center cursor-pointer"
            />
        ) : (
            <div className="w-full h-full cursor-pointer flex items-center justify-center">
              <CarPlaceholderImage car={car} />
            </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 truncate uppercase tracking-tight">{car.make} {car.model}</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{car.licensePlate}</p>
          </div>
          <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${getStatusChipClass(car.status)} ml-2 uppercase`}>
            {car.status}
          </span>
        </div>
        
        {isReservedAndActive && (
            <div className="mt-1 mb-3 flex items-center gap-2 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-100 w-fit uppercase">
                <FontAwesomeIcon icon={faClock} />
                <span>Quedan: {remainingTime}</span>
            </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm text-gray-600 my-4">
          <div className="flex items-center gap-2 truncate uppercase" title={`${new Intl.NumberFormat('es-ES').format(car.km)} km`}>
            <FontAwesomeIcon icon={faRoad} className="w-4 h-4 text-accent" />
            <span className="font-medium">{car.km ? `${new Intl.NumberFormat('es-ES').format(car.km)} KM` : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 truncate uppercase" title={car.registrationDate ? new Date(car.registrationDate).getFullYear().toString() : 'N/A'}>
            <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-accent" />
            <span className="font-medium">{car.registrationDate ? new Date(car.registrationDate).getFullYear() : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 truncate uppercase" title={displayValue(car.fuel)}>
            <FontAwesomeIcon icon={faGasPump} className="w-4 h-4 text-accent" />
            <span className="font-medium">{displayValue(car.fuel)}</span>
          </div>
          <div className="flex items-center gap-2 truncate uppercase" title={displayValue(car.transmission)}>
            <FontAwesomeIcon icon={faCogs} className="w-4 h-4 text-accent" />
            <span className="font-medium">{displayValue(car.transmission)}</span>
          </div>
          <div className="flex items-center gap-2 truncate uppercase" title={`${car.keys || 1} ${car.keys > 1 ? 'LLAVES' : 'LLAVE'}`}>
            <FontAwesomeIcon icon={faKey} className="w-4 h-4 text-accent" />
            <span className="font-medium">{`${car.keys || 1} ${car.keys > 1 ? 'LLAVES' : 'LLAVE'}`}</span>
          </div>
          <div className="flex items-center gap-2 uppercase" title={`SEGURO: ${car.hasInsurance ? 'SÍ' : 'NO'}`}>
            <FontAwesomeIcon icon={faShieldAlt} className={`w-4 h-4 flex-shrink-0 text-accent ${!car.hasInsurance ? 'opacity-40' : ''}`} />
            <ToggleSwitch enabled={car.hasInsurance} onChange={() => onUpdateInsurance(car, !car.hasInsurance)} />
          </div>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
          <div className="text-center sm:text-left w-full sm:w-auto">
            {car.status === 'Vendido' && car.salePrice ? (
              <div className="flex items-baseline gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Precio Vendido</p>
                  <p className="text-2xl font-extrabold text-green-600">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.salePrice)}
                  </p>
                </div>
                {canViewSensitiveData && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Compra</p>
                    <p className="text-base font-bold text-gray-500">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Precio Venta</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            {car.status === 'Vendido' && (
              <button onClick={(e) => { e.stopPropagation(); onAddIncidentClick(car); }} className="p-2.5 aspect-square text-accent bg-red-50 border border-red-100 rounded-md hover:bg-red-100 flex items-center justify-center transition-colors" title="Añadir Incidencia">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </button>
            )}
            {(car.status === 'En venta' || car.status === 'Reservado') && (
              <button onClick={(e) => { e.stopPropagation(); onSellClick(car); }} disabled={isLockedForUser} className="p-2.5 aspect-square text-green-600 bg-green-50 border border-green-100 rounded-md hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Vender">
                <FontAwesomeIcon icon={faHandHoldingUsd} />
              </button>
            )}
            {car.status === 'En venta' && (
              <button onClick={(e) => { e.stopPropagation(); onReserveClick(car); }} disabled={isLockedForUser} className="p-2.5 aspect-square text-yellow-600 bg-yellow-50 border border-yellow-100 rounded-md hover:bg-yellow-100 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Reservar">
                <FontAwesomeIcon icon={faBell} />
              </button>
            )}
            {car.status === 'Reservado' && (
              <button onClick={(e) => { e.stopPropagation(); onCancelReservationClick(car); }} className="p-2.5 aspect-square text-red-600 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 flex items-center justify-center transition-colors" title="Cancelar Reserva">
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