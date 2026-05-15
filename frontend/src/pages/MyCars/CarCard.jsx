// autogest-app/frontend/src/pages/MyCars/CarCard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faBan, faBell, faHandHoldingUsd,
  faExclamationTriangle, faClock, faEllipsisV, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import CarPlaceholderImage from './CarPlaceholderImage';

const CarCard = ({
  car,
  onViewDetailsClick,
  onSellClick,
  onReserveClick,
  onCancelReservationClick,
  onUpdateInsurance,
  onAddIncidentClick,
}) => {
  const { user } = useContext(AuthContext);
  const [remainingTime, setRemainingTime] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
  const isLockedForUser = isReservedAndActive && user.role !== 'admin';
  const canViewSensitiveData = user.role === 'admin' || user.isOwner || !user.companyId;

  useEffect(() => {
    if (!isReservedAndActive) return;
    const interval = setInterval(() => {
      const diff = new Date(car.reservationExpiry) - new Date();
      if (diff <= 0) { setRemainingTime('Expirado'); clearInterval(interval); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const parts = [];
      if (d > 0) parts.push(`${d}d`);
      if (h > 0) parts.push(`${h}h`);
      if (m > 0 || (!d && !h)) parts.push(`${m}m`);
      setRemainingTime(parts.join(' '));
    }, 1000);
    return () => clearInterval(interval);
  }, [car.reservationExpiry, isReservedAndActive]);

  const year = car.registrationDate ? new Date(car.registrationDate).getFullYear() : null;
  const kmFormatted = car.km ? new Intl.NumberFormat('es-ES').format(car.km) + ' km' : null;
  const specParts = [car.fuel, car.transmission, year].filter(Boolean);
  const specLine = specParts.join(' · ');

  const formatEur = (val) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const purchasePrice = car.purchasePrice ?? null;
  const salePrice = car.status === 'Vendido' ? (car.salePrice ?? null) : (car.price ?? null);
  const beneficio = purchasePrice != null && salePrice != null ? salePrice - purchasePrice : null;
  const daysAgo = car.createdAt ? Math.floor((Date.now() - new Date(car.createdAt)) / 86400000) : null;

  const statusStyles = {
    Vendido: 'bg-[#10b981] text-white',
    'En venta': 'bg-[#3b82f6] text-white',
    Reservado: 'bg-[#f59e0b] text-white',
    Taller: 'bg-gray-500 text-white',
  };
  const chipClass = statusStyles[car.status] ?? 'bg-gray-500 text-white';

  return (
    <div className={`bg-white rounded-[14px] border border-gray-200 shadow-sm hover:shadow-md hover:border-[#020B1C] transition-all duration-200 overflow-hidden select-none ${isLockedForUser ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2">
        <button
          className="font-extrabold text-[#020B1C] text-base uppercase tracking-tight leading-tight text-left hover:opacity-80 transition-opacity line-clamp-1 flex-1"
          onClick={() => onViewDetailsClick(car)}
        >
          {car.make} {car.model}
        </button>

        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#020B1C] transition-colors"
          >
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-30 bg-white border border-gray-200 rounded-[10px] shadow-lg py-1 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => { setMenuOpen(false); onViewDetailsClick(car); }}>
                <FontAwesomeIcon icon={faEye} className="text-[#020B1C] w-4" /> Ver detalle
              </button>

              {(car.status === 'En venta' || car.status === 'Reservado') && (
                <button className="w-full text-left px-4 py-2 text-sm text-[#10b981] hover:bg-green-50 flex items-center gap-2 disabled:opacity-40" disabled={isLockedForUser} onClick={() => { setMenuOpen(false); onSellClick(car); }}>
                  <FontAwesomeIcon icon={faHandHoldingUsd} className="w-4" /> Vender
                </button>
              )}

              {car.status === 'En venta' && (
                <button className="w-full text-left px-4 py-2 text-sm text-[#f59e0b] hover:bg-yellow-50 flex items-center gap-2 disabled:opacity-40" disabled={isLockedForUser} onClick={() => { setMenuOpen(false); onReserveClick(car); }}>
                  <FontAwesomeIcon icon={faBell} className="w-4" /> Reservar
                </button>
              )}

              {car.status === 'Reservado' && (
                <button className="w-full text-left px-4 py-2 text-sm text-[#ED123A] hover:bg-red-50 flex items-center gap-2" onClick={() => { setMenuOpen(false); onCancelReservationClick(car); }}>
                  <FontAwesomeIcon icon={faBan} className="w-4" /> Cancelar reserva
                </button>
              )}

              {car.status === 'Vendido' && (
                <button className="w-full text-left px-4 py-2 text-sm text-[#ED123A] hover:bg-red-50 flex items-center gap-2" onClick={() => { setMenuOpen(false); onAddIncidentClick(car); }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-4" /> Añadir incidencia
                </button>
              )}

              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => { setMenuOpen(false); onUpdateInsurance(car, !car.hasInsurance); }}>
                <FontAwesomeIcon icon={faShieldAlt} className={`w-4 ${car.hasInsurance ? 'text-[#10b981]' : 'text-gray-300'}`} /> {car.hasInsurance ? 'Quitar seguro' : 'Añadir seguro'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 px-4 pb-3 cursor-pointer" onClick={() => onViewDetailsClick(car)}>
        <div className="flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          {car.imageUrl ? (
            <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover object-center" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CarPlaceholderImage car={car} />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center gap-1 min-w-0">
          {specLine && <p className="text-sm text-gray-500 truncate capitalize">{specLine}</p>}
          {kmFormatted && <p className="text-sm text-gray-500 truncate">{kmFormatted}</p>}
          {car.licensePlate && <p className="text-sm font-bold text-gray-800 uppercase tracking-wider">{car.licensePlate}</p>}
          {isReservedAndActive && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#f59e0b] bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 w-fit mt-0.5">
              <FontAwesomeIcon icon={faClock} className="text-[10px]" /> Quedan: {remainingTime}
            </span>
          )}
        </div>
      </div>

      {canViewSensitiveData && (purchasePrice != null || salePrice != null) && (
        <div className="mx-4 mb-3 rounded-lg bg-gray-50 border border-gray-200 grid grid-cols-3 divide-x divide-gray-200 text-center py-2">
          {purchasePrice != null && (
            <div className="px-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Compra</p>
              <p className="text-sm font-bold text-[#ED123A]">-{formatEur(purchasePrice)}</p>
            </div>
          )}
          {salePrice != null && (
            <div className="px-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Venta</p>
              <p className="text-sm font-extrabold text-[#020B1C]">{formatEur(salePrice)}</p>
            </div>
          )}
          {beneficio != null && (
            <div className="px-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Beneficio</p>
              <p className={`text-sm font-bold ${beneficio >= 0 ? 'text-[#10b981]' : 'text-[#ED123A]'}`}>{beneficio >= 0 ? '+' : ''}{formatEur(beneficio)}</p>
            </div>
          )}
          {purchasePrice == null && salePrice != null && beneficio == null && (
            <div className="col-span-2 px-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Precio venta</p>
              <p className="text-sm font-extrabold text-[#020B1C]">{formatEur(salePrice)}</p>
            </div>
          )}
        </div>
      )}

      {!canViewSensitiveData && salePrice != null && (
        <div className="mx-4 mb-3 rounded-lg bg-gray-50 border border-gray-200 text-center py-2 px-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Precio venta</p>
          <p className="text-sm font-extrabold text-[#020B1C]">{formatEur(salePrice)}</p>
        </div>
      )}

      <div className="flex items-center justify-between px-4 pb-3">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-[6px] uppercase tracking-wide ${chipClass}`}>
          {car.status}
        </span>
        {car.hasInsurance && (
          <span className="text-xs text-gray-400 flex items-center gap-1 font-semibold uppercase tracking-wider">
            <FontAwesomeIcon icon={faShieldAlt} className="text-[#10b981] text-[10px]" /> Asegurado
          </span>
        )}
      </div>

      <div className="border-t border-gray-100 flex items-center justify-between px-4 py-2.5 gap-2 bg-gray-50/50">
        <button onClick={() => onViewDetailsClick(car)} className="flex items-center gap-1.5 text-xs font-bold text-[#020B1C] hover:opacity-80 uppercase tracking-wide">
          <FontAwesomeIcon icon={faEye} /> Ver detalle
        </button>

        <div className="flex items-center gap-3">
          {daysAgo != null && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <FontAwesomeIcon icon={faClock} className="text-gray-300" />
              Insertado {daysAgo === 0 ? 'hoy' : `hace ${daysAgo} ${daysAgo === 1 ? 'día' : 'días'}`}
            </span>
          )}
        </div>
      </div>

      {menuOpen && <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />}
    </div>
  );
};

export default CarCard;